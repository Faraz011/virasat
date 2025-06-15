import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

// Simple device detection without external dependencies
function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)

  let deviceType = "Desktop"
  if (isTablet) deviceType = "Tablet"
  else if (isMobile) deviceType = "Mobile"

  let browser = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  let deviceName = "Unknown Device"
  if (userAgent.includes("Windows")) deviceName = "Windows PC"
  else if (userAgent.includes("Mac")) deviceName = "Mac"
  else if (userAgent.includes("iPhone")) deviceName = "iPhone"
  else if (userAgent.includes("iPad")) deviceName = "iPad"
  else if (userAgent.includes("Android")) deviceName = "Android Device"

  return { deviceType, deviceName, browser }
}

// Generate simple UUID without external dependency
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, firstName: string, lastName: string) {
  const hashedPassword = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash, first_name, last_name) 
    VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName}) 
    RETURNING id, email, first_name, last_name
  `

  const user = result[0]

  // For now, we'll skip email verification in development
  console.log(`User created: ${user.email} - Email verification would be sent in production`)

  return user
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, first_name, last_name, is_admin 
    FROM users 
    WHERE email = ${email}
  `

  return result[0] || null
}

export async function getUserById(id: number) {
  const result = await sql`
    SELECT id, email, first_name, last_name, phone, is_admin 
    FROM users 
    WHERE id = ${id}
  `

  return result[0] || null
}

export async function createSession(userId: number, userAgent?: string, ipAddress?: string) {
  // Generate a unique token ID for this session
  const tokenId = generateUUID()

  // Parse user agent to get device information
  let deviceType = "Desktop"
  let deviceName = "Unknown Device"
  let browser = "Unknown Browser"

  if (userAgent) {
    const parsed = parseUserAgent(userAgent)
    deviceType = parsed.deviceType
    deviceName = parsed.deviceName
    browser = parsed.browser
  }

  // Calculate expiration (7 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Create JWT token with token ID
  const token = await new SignJWT({ userId, tokenId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey)

  // Store session in database (optional - won't break if it fails)
  try {
    await sql`
      INSERT INTO user_sessions (
        user_id, token_id, device_type, device_name, browser, 
        ip_address, expires_at, is_current
      ) 
      VALUES (
        ${userId}, ${tokenId}, ${deviceType}, ${deviceName}, ${browser}, 
        ${ipAddress || null}, ${expiresAt.toISOString()}, true
      )
    `
  } catch (error) {
    console.log("Session tracking failed, but login will continue:", error)
  }

  // Set cookie
  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return token
}

export async function getSession() {
  const session = cookies().get("session")?.value

  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, secretKey)

    // Update last_active timestamp for this session (optional)
    if (payload.tokenId) {
      try {
        await sql`
          UPDATE user_sessions 
          SET last_active = NOW() 
          WHERE token_id = ${payload.tokenId}
        `
      } catch (error) {
        console.log("Failed to update session activity:", error)
      }
    }

    return payload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session || !session.userId) return null

  return getUserById(Number(session.userId))
}

export async function logout() {
  const session = cookies().get("session")?.value

  if (session) {
    try {
      // Verify the token to get the token ID
      const { payload } = await jwtVerify(session, secretKey)

      if (payload.tokenId) {
        // Remove the session from the database
        await sql`
          DELETE FROM user_sessions 
          WHERE token_id = ${payload.tokenId}
        `
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  cookies().delete("session")
}

export async function getUserSessions(userId: number) {
  // Get current session token ID
  let currentTokenId = null
  const session = cookies().get("session")?.value

  if (session) {
    try {
      const { payload } = await jwtVerify(session, secretKey)
      currentTokenId = payload.tokenId
    } catch (error) {
      console.error("Error getting current session:", error)
    }
  }

  // Get all active sessions for the user
  try {
    const sessions = await sql`
      SELECT 
        id, token_id, device_type, device_name, browser, 
        ip_address, location, last_active, created_at
      FROM user_sessions 
      WHERE 
        user_id = ${userId} AND 
        expires_at > NOW()
      ORDER BY last_active DESC
    `

    // Mark the current session
    return sessions.map((session) => ({
      ...session,
      is_current: session.token_id === currentTokenId,
    }))
  } catch (error) {
    console.log("Failed to get user sessions:", error)
    return []
  }
}

export async function revokeSession(userId: number, sessionId: number) {
  // Get current session token ID
  let currentTokenId = null
  const session = cookies().get("session")?.value

  if (session) {
    try {
      const { payload } = await jwtVerify(session, secretKey)
      currentTokenId = payload.tokenId
    } catch (error) {
      console.error("Error getting current session:", error)
    }
  }

  // Get the session to be revoked
  const sessionToRevoke = await sql`
    SELECT token_id FROM user_sessions 
    WHERE id = ${sessionId} AND user_id = ${userId}
  `

  if (sessionToRevoke.length === 0) {
    throw new Error("Session not found or not authorized")
  }

  // Delete the session
  await sql`DELETE FROM user_sessions WHERE id = ${sessionId} AND user_id = ${userId}`

  // If revoking current session, also clear the cookie
  if (sessionToRevoke[0].token_id === currentTokenId) {
    cookies().delete("session")
    return true
  }

  return false
}

export async function revokeAllOtherSessions(userId: number) {
  // Get current session token ID
  let currentTokenId = null
  const session = cookies().get("session")?.value

  if (session) {
    try {
      const { payload } = await jwtVerify(session, secretKey)
      currentTokenId = payload.tokenId
    } catch (error) {
      console.error("Error getting current session:", error)
    }
  }

  if (!currentTokenId) {
    throw new Error("Current session not found")
  }

  // Delete all other sessions
  await sql`
    DELETE FROM user_sessions 
    WHERE user_id = ${userId} AND token_id != ${currentTokenId}
  `

  return true
}

export async function cleanupExpiredSessions() {
  // Delete expired sessions
  try {
    const result = await sql`DELETE FROM user_sessions WHERE expires_at < NOW()`
    return result.count
  } catch (error) {
    console.log("Failed to cleanup expired sessions:", error)
    return 0
  }
}

// Token verification function - this was missing!
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Email verification functions (simplified for now)
export async function createEmailVerificationToken(userId: number, email: string) {
  // For development, just return a simple token
  const token = generateUUID()
  console.log(`Email verification token for ${email}: ${token}`)
  return token
}

export async function sendVerificationEmail(email: string, token: string) {
  // For development, just log the email
  console.log(`Verification email would be sent to: ${email}`)
  console.log(`Verification link: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`)
  return true
}
