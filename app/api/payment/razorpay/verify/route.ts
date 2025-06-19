import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder } from "@/lib/orders"
import { config, validateEnvironmentVariables } from "@/lib/config"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    console.log("=== Payment Verification API Called ===")

    // Validate environment variables
    try {
      validateEnvironmentVariables()
    } catch (error: any) {
      console.error("Environment validation failed:", error.message)
      return NextResponse.json({ message: "Server configuration error. Please contact support." }, { status: 500 })
    }

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
      mode: config.razorpay.isTestMode ? "TEST" : "LIVE",
    })

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    console.log("Signature verification:", isAuthentic ? "SUCCESS" : "FAILED")

    if (!isAuthentic) {
      console.error("Payment signature verification failed")
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 })
    }

    // Create the order in our database
    console.log("Creating order in database...")
    const order = await createOrder({
      userId: user.id,
      total: orderData.total,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    })

    console.log("Database order created:", order.id)

    // Clear the user's cart after successful order
    try {
      await fetch(`${config.app.url}/api/cart/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
      })
      console.log("Cart cleared successfully")
    } catch (cartError) {
      console.error("Failed to clear cart:", cartError)
      // Don't fail the order creation if cart clearing fails
    }

    return NextResponse.json({
      message: "Payment verified successfully",
      orderId: order.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      isTestMode: config.razorpay.isTestMode,
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        message: "Payment verification failed",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
