import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { config, validateEnvironmentVariables } from "@/lib/config"
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    console.log("=== Razorpay Payment API Called ===")

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

    const requestBody = await request.json()
    const { amount, currency = "INR", receipt = `receipt_${Date.now()}` } = requestBody

    console.log("Payment request data:", { amount, currency, receipt })
    console.log("Razorpay mode:", config.razorpay.isTestMode ? "TEST" : "LIVE")

    if (!amount || amount < 1) {
      console.error("Invalid amount:", amount)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // Initialize Razorpay with config
    console.log("Initializing Razorpay...")
    const razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    })

    // Create Razorpay order
    console.log("Creating Razorpay order...")
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt,
      notes: {
        user_id: user.id.toString(),
        mode: config.razorpay.isTestMode ? "test" : "live",
      },
    })

    console.log("Razorpay order created successfully:", {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    })

    // Return the response
    const responseData = {
      keyId: config.razorpay.keyId,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      isTestMode: config.razorpay.isTestMode,
    }

    console.log("Sending response:", { ...responseData, keyId: "HIDDEN_FOR_SECURITY" })
    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("=== Razorpay API Error ===")
    console.error("Error:", error)
    console.error("Stack:", error.stack)

    return NextResponse.json(
      {
        message: "Failed to create payment order",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
