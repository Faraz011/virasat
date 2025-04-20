import { NextResponse } from "next/server"
import crypto from "crypto"
import { sql } from "@/lib/db"
import { updateOrderStatus } from "@/lib/orders"

export async function POST(request: Request) {
  try {
    // Check if key secret is available
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: "Razorpay configuration is missing. Please contact support." },
        { status: 500 },
      )
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Find the order in our database
      const orders = await sql`
        SELECT id FROM orders WHERE razorpay_order_id = ${razorpay_order_id}
      `

      if (orders.length === 0) {
        return NextResponse.json({ message: "Order not found" }, { status: 404 })
      }

      const orderId = orders[0].id

      // Update the order status
      await updateOrderStatus(orderId, "paid", {
        razorpay_payment_id,
        razorpay_signature,
      })

      return NextResponse.json({
        message: "Payment verified successfully",
        orderId,
      })
    } else {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ message: "Failed to verify payment" }, { status: 500 })
  }
}
