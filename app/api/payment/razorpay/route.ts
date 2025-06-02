import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    console.log("=== Razorpay Payment API Called ===")

    const user = await getCurrentUser()
    console.log("Current user:", user ? `ID: ${user.id}` : "Not authenticated")

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if environment variables are available
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    console.log("RAZORPAY_KEY_ID:", keyId ? `${keyId.substring(0, 10)}...` : "MISSING")
    console.log("RAZORPAY_KEY_SECRET:", keySecret ? "EXISTS" : "MISSING")

    if (!keyId || !keySecret) {
      console.error("Missing Razorpay environment variables")
      return NextResponse.json(
        { message: "Razorpay configuration is missing. Please contact support." },
        { status: 500 },
      )
    }

    const requestBody = await request.json()
    const { amount, currency = "INR", receipt } = requestBody
    console.log("Payment request data:", { amount, currency, receipt })

    if (!amount || amount < 1) {
      console.error("Invalid amount:", amount)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // Import and initialize Razorpay
    const Razorpay = (await import("razorpay")).default
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Create only the Razorpay order (not database order yet)
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    }

    console.log("Creating Razorpay order with options:", options)

    const razorpayOrder = await razorpay.orders.create(options)

    console.log("Razorpay order created successfully:", {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status,
    })

    // Return the Razorpay order details
    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id, // 👈 This is the key fix!
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: keyId,
    })
  } catch (error: any) {
    console.error("=== Error in Razorpay API ===")
    console.error("Error:", error)

    return NextResponse.json(
      {
        message: error.description || error.message || "Failed to create payment order",
        error: error.description || error.message,
      },
      { status: 500 },
    )
  }
}
