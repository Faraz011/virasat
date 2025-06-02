import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, secretKey)

    if (payload.type !== "password_reset") {
      return NextResponse.json({ message: "Invalid token type" }, { status: 400 })
    }

    const userId = Number(payload.userId)

    // Check if token exists in database and is not expired
    const tokenRecord = await sql`
      SELECT * FROM password_reset_tokens 
      WHERE user_id = ${userId} AND token = ${token} AND expires_at > NOW()
    `

    if (tokenRecord.length === 0) {
      return NextResponse.json({ message: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword} 
      WHERE id = ${userId}
    `

    // Delete all password reset tokens for this user
    await sql`
      DELETE FROM password_reset_tokens 
      WHERE user_id = ${userId}
    `

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Password reset error:", error)
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
  }
}
