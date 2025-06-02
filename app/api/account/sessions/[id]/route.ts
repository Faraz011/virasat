import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, revokeSession } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = Number.parseInt(params.id, 10)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }

    const isCurrentSession = await revokeSession(user.id, sessionId)

    return NextResponse.json({
      success: true,
      message: "Session revoked successfully",
      isCurrentSession,
    })
  } catch (error) {
    console.error("Error revoking session:", error)
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 })
  }
}
