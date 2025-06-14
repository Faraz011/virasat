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

    console.log("Environment variables check:")
    console.log("- RAZORPAY_KEY_ID:", keyId ? "EXISTS" : "MISSING")
    console.log("- RAZORPAY_KEY_SECRET:", keySecret ? "EXISTS" : "MISSING")

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
    console.log("Initializing Razorpay...")
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Create Razorpay order with try-catch
    console.log("Creating Razorpay order...")
    let order
    try {
      order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // amount in paise, ensure it's an integer
        currency,
        receipt,
      })
      console.log("Razorpay order created successfully:", order)
    } catch (orderError: any) {
      console.error("Failed to create Razorpay order:", orderError)
      return NextResponse.json(
        {
          message: "Failed to create payment order with Razorpay",
          error: orderError.description || orderError.message,
        },
        { status: 500 },
      )
    }

    // Validate order object
    if (!order || !order.id) {
      console.error("Invalid order response from Razorpay:", order)
      return NextResponse.json({ message: "Invalid response from payment gateway" }, { status: 500 })
    }

    // Prepare response
    const responseData = {
      keyId: keyId,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    }

    console.log("Sending response:", responseData)

    // Return the response with the EXACT field name razorpayOrderId
    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("=== Unexpected error in Razorpay API ===")
    console.error("Error:", error)
    console.error("Stack:", error.stack)

    return NextResponse.json(
      {
        message: "An unexpected error occurred while processing your payment request",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
