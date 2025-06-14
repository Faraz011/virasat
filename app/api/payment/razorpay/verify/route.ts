import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder } from "@/lib/orders"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    console.log("=== Payment Verification API Called ===")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await request.json()

    console.log("Verification data:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? "PROVIDED" : "MISSING",
      orderData: orderData ? "PROVIDED" : "MISSING",
    })

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ message: "Razorpay configuration missing" }, { status: 500 })
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    console.log("Signature verification:", isAuthentic ? "SUCCESS" : "FAILED")

    if (!isAuthentic) {
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 })
    }

    // Now create the order in our database
    let order
    if (orderData) {
      console.log("Creating order in database...")
      order = await createOrder({
        userId: user.id,
        total: orderData.amount || orderData.total,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        razorpayOrderId: razorpay_order_id,
      })
      console.log("Database order created:", order.id)
    }

    return NextResponse.json({
      message: "Payment verified successfully",
      orderId: order?.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ message: "Payment verification failed" }, { status: 500 })
  }
}
