import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, revokeAllOtherSessions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await revokeAllOtherSessions(user.id)

    return NextResponse.json({
      success: true,
      message: "All other sessions revoked successfully",
    })
  } catch (error) {
    console.error("Error revoking all sessions:", error)
    return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 })
  }
}
