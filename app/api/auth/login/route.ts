import { type NextRequest, NextResponse } from "next/server"
import { comparePasswords, createSession, getUserByEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email)

    // If user not found or password doesn't match
    if (!user || !(await comparePasswords(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Get user agent and IP address for session tracking
    const userAgent = request.headers.get("user-agent") || undefined
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined

    // Create session
    await createSession(user.id, userAgent, ipAddress)

    // Return user data (excluding password)
    const { password_hash, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
