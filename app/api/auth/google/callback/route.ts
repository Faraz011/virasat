import { NextResponse } from "next/server"
import { createUser, getUserByEmail, createSession } from "@/lib/auth"
import { sql } from "@/lib/db" // Declare the sql variable

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
      return NextResponse.json({ message: "Google OAuth is not configured" }, { status: 500 })
    }

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
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from Google")
    }

    const googleUser = await userResponse.json()

    // Check if user already exists
    let user = await getUserByEmail(googleUser.email)

    if (!user) {
      // Create new user
      const [firstName, ...lastNameParts] = (googleUser.name || "").split(" ")
      const lastName = lastNameParts.join(" ") || ""

      user = await createUser(
        googleUser.email,
        Math.random()
          .toString(36)
          .substring(2, 15), // Random password for Google users
        firstName || "User",
        lastName || "",
      )

      // Mark email as verified since it's from Google
      await sql`
        UPDATE users SET email_verified = true, email_verified_at = NOW() 
        WHERE id = ${user.id}
      `
    }

    // Create session
    await createSession(user.id)

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Google OAuth error:", error)
    return NextResponse.json({ message: error.message || "Authentication failed" }, { status: 500 })
  }
}
