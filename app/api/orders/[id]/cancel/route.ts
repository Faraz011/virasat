import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { cancelOrder } from "@/lib/orders"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = Number.parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const result = await cancelOrder(orderId, user.id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ message: error.message || "Failed to cancel order" }, { status: 500 })
  }
}
