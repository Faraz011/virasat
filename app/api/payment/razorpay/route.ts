import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    console.log("=== Razorpay Payment API Called ===")

    const user = await getCurrentUser()
    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    // Check environment variables
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    console.log("Environment variables check:")
    console.log("- RAZORPAY_KEY_ID:", keyId ? `EXISTS (${keyId.substring(0, 10)}...)` : "MISSING")
    console.log("- RAZORPAY_KEY_SECRET:", keySecret ? "EXISTS" : "MISSING")

    if (!keyId || !keySecret) {
      console.error("Missing Razorpay environment variables")
      return NextResponse.json(
        {
          message: "Razorpay configuration is missing. Please contact support.",
          debug: {
            keyId: !!keyId,
            keySecret: !!keySecret,
          },
        },
        { status: 500 },
      )
    }

    const requestBody = await request.json()
    const { amount, currency = "INR", receipt = `receipt_${Date.now()}` } = requestBody

    console.log("Payment request data:", { amount, currency, receipt })

    if (!amount || amount < 1) {
      console.error("Invalid amount:", amount)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // Dynamic import of Razorpay to avoid bundling issues
    const Razorpay = (await import("razorpay")).default

    // Initialize Razorpay
    console.log("Initializing Razorpay...")
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Create Razorpay order
    console.log("Creating Razorpay order with amount:", Math.round(amount * 100))

    const orderOptions = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt,
      notes: {
        user_id: user.id.toString(),
        timestamp: new Date().toISOString(),
      },
    }

    console.log("Order options:", orderOptions)

    const order = await razorpay.orders.create(orderOptions)

    console.log("Razorpay order created successfully:")
    console.log("- Order ID:", order.id)
    console.log("- Amount:", order.amount)
    console.log("- Currency:", order.currency)
    console.log("- Status:", order.status)

    // Validate order response
    if (!order || !order.id) {
      console.error("Invalid order response from Razorpay:", order)
      return NextResponse.json(
        {
          message: "Invalid response from payment gateway",
          debug: { order },
        },
        { status: 500 },
      )
    }

    // Return the response with consistent field names
    const responseData = {
      success: true,
      keyId: keyId,
      razorpayOrderId: order.id, // This is the key field
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      isTestMode: keyId.startsWith("rzp_test_"),
    }

    console.log("Sending successful response:")
    console.log("- razorpayOrderId:", responseData.razorpayOrderId)
    console.log("- amount:", responseData.amount)
    console.log("- isTestMode:", responseData.isTestMode)

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("=== Razorpay API Error ===")
    console.error("Error type:", error.constructor.name)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    // Check if it's a Razorpay specific error
    if (error.statusCode) {
      console.error("Razorpay error code:", error.statusCode)
      console.error("Razorpay error description:", error.error?.description)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment order",
        error: error.message,
        debug: {
          errorType: error.constructor.name,
          statusCode: error.statusCode,
          razorpayError: error.error,
        },
      },
      { status: 500 },
    )
  }
}
