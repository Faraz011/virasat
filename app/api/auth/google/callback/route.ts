import { NextResponse } from "next/server"
import { getUserByEmail, createSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ message: "Authorization code is required" }, { status: 400 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/google`

    if (!clientId || !clientSecret) {
      console.error("Google OAuth environment variables not configured")
      return NextResponse.json({ message: "Google OAuth is not configured" }, { status: 500 })
    }

    console.log("Exchanging code for token...")

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange failed:", errorData)
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    console.log("Token exchange successful")

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error("Failed to get user info:", errorData)
      throw new Error("Failed to get user info from Google")
    }

    const googleUser = await userResponse.json()
    console.log("Google user info retrieved:", { email: googleUser.email, name: googleUser.name })

    // Check if user already exists
    let user = await getUserByEmail(googleUser.email)

    if (!user) {
      console.log("Creating new user for Google OAuth")

      // Create new user
      const [firstName, ...lastNameParts] = (googleUser.name || "").split(" ")
      const lastName = lastNameParts.join(" ") || ""

      // Generate a random password for Google users (they won't use it)
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Insert user directly with SQL to avoid password hashing issues
      const result = await sql`
        INSERT INTO users (email, password_hash, first_name, last_name, email_verified, email_verified_at) 
        VALUES (${googleUser.email}, ${randomPassword}, ${firstName || "User"}, ${lastName || ""}, true, NOW()) 
        RETURNING id, email, first_name, last_name
      `

      user = result[0]
      console.log("New user created:", { id: user.id, email: user.email })
    } else {
      console.log("Existing user found:", { id: user.id, email: user.email })

      // Mark email as verified if not already
      if (!user.email_verified) {
        await sql`
          UPDATE users SET email_verified = true, email_verified_at = NOW() 
          WHERE id = ${user.id}
        `
        console.log("Email marked as verified for existing user")
      }
    }

    // Create session
    console.log("Creating session for user:", user.id)
    await createSession(user.id)

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Google OAuth error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Authentication failed",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
