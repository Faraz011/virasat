import { NextResponse } from "next/server"
import { verifyPasswordResetToken, deletePasswordResetToken } from "@/lib/email"
import { hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Verify the reset token
    const { userId } = await verifyPasswordResetToken(token)

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update the user's password
    await sql`
      UPDATE users SET password_hash = ${hashedPassword} 
      WHERE id = ${userId}
    `

    // Delete the reset token
    await deletePasswordResetToken(userId)

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: error.message || "Invalid or expired reset token" }, { status: 400 })
  }
}
