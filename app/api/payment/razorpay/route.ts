import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

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

    // 2. Check environment variables
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

    console.log("Environment variables check:")
    console.log("- RAZORPAY_KEY_ID:", keyId ? `EXISTS (${keyId.substring(0, 10)}...)` : "MISSING")
    console.log("- RAZORPAY_KEY_SECRET:", keySecret ? "EXISTS" : "MISSING")
    console.log(
      "- NEXT_PUBLIC_RAZORPAY_KEY_ID:",
      publicKeyId ? `EXISTS (${publicKeyId.substring(0, 10)}...)` : "MISSING",
    )

    if (!keyId || !keySecret || !publicKeyId) {
      console.error("❌ Missing Razorpay environment variables")
      return NextResponse.json(
        {
          error: "Payment gateway configuration error",
          message: "Razorpay credentials are not properly configured. Please contact support.",
          details: {
            keyId: !!keyId,
            keySecret: !!keySecret,
            publicKeyId: !!publicKeyId,
          },
        },
        { status: 500 },
      )
    }

    // 3. Parse and validate request
    const body = await request.json()
    const { amount, currency = "INR" } = body

    if (!amount || typeof amount !== "number" || amount <= 0) {
      console.error("❌ Invalid amount:", amount)
      return NextResponse.json({ error: "Invalid amount provided" }, { status: 400 })
    }

    console.log("✅ Request validated - Amount:", amount, "Currency:", currency)

    // 4. Import and initialize Razorpay
    const Razorpay = (await import("razorpay")).default
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    console.log("✅ Razorpay instance created")

    // 5. Create Razorpay order
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

    // 6. Validate the order response
    if (!razorpayOrder || !razorpayOrder.id) {
      console.error("❌ Invalid order response from Razorpay:", razorpayOrder)
      return NextResponse.json(
        {
          error: "Payment gateway error",
          message: "Failed to create a valid payment order",
        },
        { status: 500 },
      )
    }

    // 7. Return the correct response format
    const response = {
      success: true,
      id: razorpayOrder.id, // This is the actual Razorpay order ID
      orderId: razorpayOrder.id, // Also provide as orderId for compatibility
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status,
      keyId: publicKeyId, // Use the public key for frontend
      isTestMode: keyId.startsWith("rzp_test_"),
    }

    console.log("✅ Sending response to client:")
    console.log("- Order ID:", response.id)
    console.log("- Amount:", response.amount, "paise")
    console.log("- Test Mode:", response.isTestMode)

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
          razorpayError: error.error,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create payment order",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
