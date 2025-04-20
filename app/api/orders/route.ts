import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder, getUserOrders } from "@/lib/orders"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { items, shippingAddress, paymentMethod, amount, notes } = await request.json()

    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create order
    const order = await createOrder({
      userId: user.id,
      amount,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: error.message || "Failed to create order" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user orders
    const orders = await getUserOrders(user.id)

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch orders" }, { status: 500 })
  }
}
