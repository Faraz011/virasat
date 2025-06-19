import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder } from "@/lib/orders"
import { validateRazorpayConfig } from "@/lib/razorpay-config"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    console.log("🔐 Razorpay Payment Verification - Starting")

    // 1. Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ User not authenticated")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.id)

    // 2. Validate Razorpay configuration
    const configValidation = validateRazorpayConfig()
    if (!configValidation.isValid) {
      console.error("❌ Razorpay configuration invalid:", configValidation.errors)
      return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 })
    }

    // 3. Parse request body
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body

    console.log("📝 Verification request:")
    console.log("- Order ID:", razorpay_order_id)
    console.log("- Payment ID:", razorpay_payment_id)
    console.log("- Signature:", razorpay_signature ? "Present" : "Missing")
    console.log("- Order Data:", orderData ? "Present" : "Missing")

    // 4. Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing required payment verification fields")
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 })
    }

    // 5. Verify payment signature
    const body_string = razorpay_order_id + "|" + razorpay_payment_id
    const expected_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body_string)
      .digest("hex")

    const is_authentic = expected_signature === razorpay_signature

    console.log("🔐 Signature verification:", is_authentic ? "✅ Valid" : "❌ Invalid")

    if (!is_authentic) {
      console.error("❌ Payment signature verification failed")
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // 6. Create order in database
    if (!orderData) {
      console.error("❌ Order data missing for database creation")
      return NextResponse.json({ error: "Order data missing" }, { status: 400 })
    }

    console.log("💾 Creating order in database...")
    const dbOrder = await createOrder({
      userId: user.id,
      total: orderData.total,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    })

    console.log("✅ Order created in database:", dbOrder.id)

    // 7. Clear user's cart (optional)
    try {
      // You can implement cart clearing here if needed
      console.log("🛒 Cart clearing skipped (implement if needed)")
    } catch (cartError) {
      console.warn("⚠️ Cart clearing failed:", cartError)
      // Don't fail the order creation if cart clearing fails
    }

    // 8. Return success response
    const response = {
      success: true,
      orderId: dbOrder.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      isTestMode: configValidation.isTestMode,
      message: "Payment verified and order created successfully",
    }

    console.log("✅ Payment verification completed successfully")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Payment Verification Error:")
    console.error("- Type:", error.constructor.name)
    console.error("- Message:", error.message)
    console.error("- Stack:", error.stack)

    return NextResponse.json(
      {
        error: "Payment verification failed",
        message: "Internal server error during payment verification",
      },
      { status: 500 },
    )
  }
}
