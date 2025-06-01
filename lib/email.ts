import { sql } from "./db"
import { SignJWT, jwtVerify } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function createEmailVerificationToken(userId: number, email: string) {
  const token = await new SignJWT({ userId, email, type: "email_verification" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey)

  // Store the token in database
  await sql`
    INSERT INTO email_verification_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${new Date(Date.now() + 24 * 60 * 60 * 1000)})
    ON CONFLICT (user_id) 
    DO UPDATE SET token = ${token}, expires_at = ${new Date(Date.now() + 24 * 60 * 60 * 1000)}, created_at = NOW()
  `

  return token
}

export async function verifyEmailToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)

    if (payload.type !== "email_verification") {
      throw new Error("Invalid token type")
    }

    // Check if token exists in database and is not expired
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

  // Delete the verification token
  await sql`
    DELETE FROM email_verification_tokens WHERE user_id = ${userId}
  `
}

export async function sendVerificationEmail(email: string, token: string) {
  // In a real application, you would use a service like SendGrid, Resend, or Nodemailer
  // For now, we'll just log the verification link
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`

  console.log(`
    📧 Email Verification Required
    To: ${email}
    Subject: Verify your email address for Virasat
    
    Please click the following link to verify your email address:
    ${verificationUrl}
    
    This link will expire in 24 hours.
  `)

  // Return the URL for development purposes
  return verificationUrl
}

export async function createPasswordResetToken(userId: number, email: string) {
  const token = await new SignJWT({ userId, email, type: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey)

  // Store the token in database
  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${new Date(Date.now() + 60 * 60 * 1000)})
    ON CONFLICT (user_id) 
    DO UPDATE SET token = ${token}, expires_at = ${new Date(Date.now() + 60 * 60 * 1000)}, created_at = NOW()
  `

  return token
}

export async function verifyPasswordResetToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)

    if (payload.type !== "password_reset") {
      throw new Error("Invalid token type")
    }

    // Check if token exists in database and is not expired
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
