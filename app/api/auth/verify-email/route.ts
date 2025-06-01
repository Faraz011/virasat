import { NextResponse } from "next/server"
import { verifyEmailToken, markEmailAsVerified } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 })
    }

    // Verify the token
    const { userId } = await verifyEmailToken(token)

    // Mark email as verified
    await markEmailAsVerified(userId)

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.json({ message: error.message || "Invalid or expired verification token" }, { status: 400 })
  }
}
