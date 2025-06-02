import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder, getUserOrders } from "@/lib/orders"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orders = await getUserOrders(user.id)
    return NextResponse.json(orders)
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderData = await request.json()

    // Validate required fields
    if (!orderData.total || !orderData.items || !orderData.shippingAddress) {
      return NextResponse.json({ message: "Missing required order data" }, { status: 400 })
    }

    const order = await createOrder({
      userId: user.id,
      total: orderData.total, // Using total instead of amount
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || "cash",
      paymentStatus: "pending",
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 })
  }
}
