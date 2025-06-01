import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/auth"
import { createPasswordResetToken } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a reset link." },
        { status: 200 },
      )
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken(user.id, user.email)

    // In a real application, send email here
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    console.log(`
      📧 Password Reset Request
      To: ${email}
      Subject: Reset your password for Virasat
      
      Please click the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
    `)

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a reset link." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
