import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/auth"
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 },
      )
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken(user.id, user.email)

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken)

    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "An error occurred. Please try again." }, { status: 500 })
  }
}
