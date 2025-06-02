import { SignJWT } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function createEmailVerificationToken(userId: number, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email, type: "email_verification" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey)

  return token
}

export async function createPasswordResetToken(userId: number, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email, type: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey)

  return token
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`

  // In development, just log the verification URL
  if (process.env.NODE_ENV === "development") {
    console.log("\n=== EMAIL VERIFICATION ===")
    console.log(`To: ${email}`)
    console.log(`Verification URL: ${verificationUrl}`)
    console.log("===========================\n")
    return
  }

  // In production, you would integrate with your email service here
  // For now, we'll just log it
  console.log(`Verification email would be sent to ${email} with URL: ${verificationUrl}`)
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

  // In development, just log the reset URL
  if (process.env.NODE_ENV === "development") {
    console.log("\n=== PASSWORD RESET ===")
    console.log(`To: ${email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log("======================\n")
    return
  }

  // In production, you would integrate with your email service here
  // For now, we'll just log it
  console.log(`Password reset email would be sent to ${email} with URL: ${resetUrl}`)
}
