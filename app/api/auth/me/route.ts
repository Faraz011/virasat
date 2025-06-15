import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0]

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get user from database
    const users = await sql`
      SELECT id, name, email, email_verified, created_at
      FROM users 
      WHERE id = ${decoded.userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const user = users[0]
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified || false,
      created_at: user.created_at,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
