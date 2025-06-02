import { sql } from "./db"
import { SignJWT, jwtVerify } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function createEmailVerificationToken(userId: number, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email, type: "email_verification" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey)

  await sql`
    INSERT INTO email_verification_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, NOW() + INTERVAL '24 hours')
    ON CONFLICT (user_id) 
    DO UPDATE SET token = ${token}, expires_at = NOW() + INTERVAL '24 hours', created_at = NOW()
  `

  return token
}

export async function verifyEmailToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)

    if (payload.type !== "email_verification") {
      throw new Error("Invalid token type")
    }

    const result = await sql`
      SELECT user_id, token FROM email_verification_tokens 
      WHERE token = ${token} AND expires_at > NOW()
    `

    if (result.length === 0) {
      throw new Error("Token not found or expired")
    }

    return { userId: Number(payload.userId), email: payload.email as string }
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

export async function markEmailAsVerified(userId: number) {
  await sql`
    UPDATE users SET email_verified = true, email_verified_at = NOW() 
    WHERE id = ${userId}
  `

  await sql`
    DELETE FROM email_verification_tokens WHERE user_id = ${userId}
  `
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`

  if (process.env.NODE_ENV === "development") {
    console.log(`
=== EMAIL VERIFICATION ===
To: ${email}
Subject: Verify your email address
Verification URL: ${verificationUrl}
========================
    `)
  }
}

export async function createPasswordResetToken(userId: number, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email, type: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey)

  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, NOW() + INTERVAL '1 hour')
    ON CONFLICT (user_id) 
    DO UPDATE SET token = ${token}, expires_at = NOW() + INTERVAL '1 hour', created_at = NOW()
  `

  return token
}

export async function verifyPasswordResetToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)

    if (payload.type !== "password_reset") {
      throw new Error("Invalid token type")
    }

    const result = await sql`
      SELECT user_id, token FROM password_reset_tokens 
      WHERE token = ${token} AND expires_at > NOW()
    `

    if (result.length === 0) {
      throw new Error("Token not found or expired")
    }

    return { userId: Number(payload.userId), email: payload.email as string }
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

export async function deletePasswordResetToken(userId: number) {
  await sql`
    DELETE FROM password_reset_tokens WHERE user_id = ${userId}
  `
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

  if (process.env.NODE_ENV === "development") {
    console.log(`
=== PASSWORD RESET ===
To: ${email}
Subject: Reset your password
Reset URL: ${resetUrl}
===================
    `)
  }
}
