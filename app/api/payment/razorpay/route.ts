import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    console.log("=== Razorpay Payment API Called ===")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if environment variables are available
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error("Missing Razorpay environment variables")
      return NextResponse.json(
        { message: "Razorpay configuration is missing. Please contact support." },
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

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency,
      receipt,
    })

    console.log("Razorpay order created:", order)

    // Return the response with the EXACT field name razorpayOrderId
    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: order.id, // ✅ Using the exact field name
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error("=== Error in Razorpay API ===", error)
    return NextResponse.json(
      {
        message: error.description || error.message || "Failed to create payment order",
      },
      { status: 500 },
    )
  }
}
