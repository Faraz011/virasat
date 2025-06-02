import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { sql } from "@/lib/db"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 })
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, secretKey)

    if (payload.type !== "email_verification") {
      return NextResponse.json({ message: "Invalid token type" }, { status: 400 })
    }

    const userId = Number(payload.userId)

    // Check if token exists in database and is not expired
    const tokenRecord = await sql`
      SELECT * FROM email_verification_tokens 
      WHERE user_id = ${userId} AND token = ${token} AND expires_at > NOW()
    `

    if (tokenRecord.length === 0) {
      return NextResponse.json({ message: "Invalid or expired verification token" }, { status: 400 })
    }

    // Update user email verification status
    await sql`
      UPDATE users 
      SET email_verified = true, email_verified_at = NOW() 
      WHERE id = ${userId}
    `

    // Delete the used token
    await sql`
      DELETE FROM email_verification_tokens 
      WHERE user_id = ${userId}
    `

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
  }
}
