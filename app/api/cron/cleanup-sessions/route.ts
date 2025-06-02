import { NextResponse } from "next/server"
import { cleanupExpiredSessions } from "@/lib/auth"

// This endpoint should be called by a cron job
export async function GET() {
  try {
    const deletedCount = await cleanupExpiredSessions()

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired sessions`,
    })
  } catch (error) {
    console.error("Error cleaning up sessions:", error)
    return NextResponse.json({ error: "Failed to clean up sessions" }, { status: 500 })
  }
}
