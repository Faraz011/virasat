import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { createEmailVerificationToken, sendVerificationEmail } from "./email"
import { UAParser } from "ua-parser-js"
import { v4 as uuidv4 } from "uuid"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, firstName: string, lastName: string) {
  const hashedPassword = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash, first_name, last_name, email_verified) 
    VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName}, false) 
    RETURNING id, email, first_name, last_name
  `

  const user = result[0]

  // Create and send email verification token
  const verificationToken = await createEmailVerificationToken(user.id, user.email)
  await sendVerificationEmail(user.email, verificationToken)

  return user
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, first_name, last_name, is_admin, email_verified, email_verified_at 
    FROM users 
    WHERE email = ${email}
  `

  return result[0] || null
}

export async function getUserById(id: number) {
  const result = await sql`
    SELECT id, email, first_name, last_name, phone, is_admin, email_verified, email_verified_at 
    FROM users 
    WHERE id = ${id}
  `

  return result[0] || null
}

export async function createSession(userId: number, userAgent?: string, ipAddress?: string) {
  // Generate a unique token ID for this session
  const tokenId = uuidv4()

  // Parse user agent to get device information
  let deviceType = "Unknown"
  let deviceName = "Unknown"
  let browser = "Unknown"

  if (userAgent) {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    deviceType = result.device.type || (result.device.vendor ? "Mobile" : "Desktop")
    deviceName =
      [result.device.vendor, result.device.model].filter(Boolean).join(" ") || result.os.name || "Unknown Device"
    browser = [result.browser.name, result.browser.version].filter(Boolean).join(" ") || "Unknown Browser"
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

  // Store session in database
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

    // Update last_active timestamp for this session
    if (payload.tokenId) {
      await sql`
        UPDATE user_sessions 
        SET last_active = NOW() 
        WHERE token_id = ${payload.tokenId}
      `
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
  const result = await sql`DELETE FROM user_sessions WHERE expires_at < NOW()`
  return result.count
}
