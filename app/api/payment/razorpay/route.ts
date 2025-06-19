import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { validateRazorpayConfig, getRazorpayInstance } from "@/lib/razorpay-config"

export async function POST(request: Request) {
  try {
    console.log("🚀 Razorpay Payment API - Starting")

    // 1. Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ User not authenticated")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.id)

    // 2. Parse and validate request
    const body = await request.json()
    const { amount, currency = "INR" } = body

    if (!amount || typeof amount !== "number" || amount <= 0) {
      console.error("❌ Invalid amount:", amount)
      return NextResponse.json({ error: "Invalid amount provided" }, { status: 400 })
    }

    console.log("✅ Request validated - Amount:", amount, "Currency:", currency)

    // 3. Validate Razorpay configuration
    const configValidation = validateRazorpayConfig()
    if (!configValidation.isValid) {
      /* 🔄  FALLBACK  ──────────────────────────────────────────────
         We’re running in a preview with no secret keys.
         Return a fake order the front-end can consume.            */
      console.warn("⚠️  Razorpay keys missing – using stub order in preview.")
      const stubOrderId = `order_stub_${Date.now()}`
      return NextResponse.json({
        success: true,
        orderId: stubOrderId,
        amount: Math.round(body?.amount * 100) || 10000,
        currency: body?.currency || "INR",
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_stubkey",
        isTestMode: true,
        _stub: true,
      })
    }

    console.log("✅ Razorpay configuration valid")
    console.log("🧪 Test mode:", configValidation.isTestMode)

    // 4. Create Razorpay order
    const razorpay = await getRazorpayInstance()
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id.toString(),
        created_at: new Date().toISOString(),
      },
    }

    console.log("📝 Creating Razorpay order with options:", {
      ...orderOptions,
      amount: `${orderOptions.amount} paise (₹${amount})`,
    })

    const razorpayOrder = await razorpay.orders.create(orderOptions)

    console.log("✅ Razorpay order created successfully:")
    console.log("- Order ID:", razorpayOrder.id)
    console.log("- Amount:", razorpayOrder.amount, "paise")
    console.log("- Currency:", razorpayOrder.currency)
    console.log("- Status:", razorpayOrder.status)

    // 5. Return response
    const response = {
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      isTestMode: configValidation.isTestMode,
    }

    console.log("✅ Sending response to client")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Razorpay API Error:")
    console.error("- Type:", error.constructor.name)
    console.error("- Message:", error.message)
    console.error("- Stack:", error.stack)

    // Handle Razorpay specific errors
    if (error.statusCode && error.error) {
      console.error("- Razorpay Error Code:", error.statusCode)
      console.error("- Razorpay Error:", error.error)

      return NextResponse.json(
        {
          error: "Payment gateway error",
          message: error.error.description || error.message,
          code: error.error.code,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create payment order",
      },
      { status: 500 },
    )
  }
}
