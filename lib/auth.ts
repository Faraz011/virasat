import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { createEmailVerificationToken, sendVerificationEmail } from "./email"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, firstName: string, lastName: string) {
  const hashedPassword = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash, first_name, last_name, email_verified) 
    VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName}, false) 
    RETURNING id, email, first_name, last_name
  `

  const user = result[0]

  // Create and send email verification token
  const verificationToken = await createEmailVerificationToken(user.id, user.email)
  await sendVerificationEmail(user.email, verificationToken)

  return user
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, first_name, last_name, is_admin, email_verified, email_verified_at 
    FROM users 
    WHERE email = ${email}
  `

  return result[0] || null
}

export async function getUserById(id: number) {
  const result = await sql`
    SELECT id, email, first_name, last_name, phone, is_admin, email_verified, email_verified_at 
    FROM users 
    WHERE id = ${id}
  `

  return result[0] || null
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey)

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return token
}

export async function getSession() {
  const session = cookies().get("session")?.value

  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, secretKey)
    return payload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session || !session.userId) return null

  return getUserById(Number(session.userId))
}

export async function logout() {
  cookies().delete("session")
}
