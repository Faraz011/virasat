import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getOrderById } from "@/lib/orders"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = Number.parseInt(params.id, 10)
    if (isNaN(orderId)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Check if the order belongs to the current user (unless admin)
    if (order.user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch order" }, { status: 500 })
  }
}
