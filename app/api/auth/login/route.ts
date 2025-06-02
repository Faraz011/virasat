import { NextResponse } from "next/server"
import { comparePasswords, createSession, getUserByEmail } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Check if required fields are provided
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Get user agent and IP address for session tracking
    const userAgent = request.headers.get("user-agent") || undefined
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined

    // Create session
    await createSession(user.id, userAgent, ipAddress)

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
