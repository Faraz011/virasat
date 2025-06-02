import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder } from "@/lib/orders"

// Import Razorpay but don't initialize it yet
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    console.log("Razorpay payment API called")

    const user = await getCurrentUser()
    console.log("Current user:", user ? `ID: ${user.id}` : "Not authenticated")

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if environment variables are available
    console.log("Checking Razorpay environment variables...")
    console.log("RAZORPAY_KEY_ID exists:", !!process.env.RAZORPAY_KEY_ID)
    console.log("RAZORPAY_KEY_SECRET exists:", !!process.env.RAZORPAY_KEY_SECRET)

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay environment variables")
      return NextResponse.json(
        { message: "Razorpay configuration is missing. Please contact support." },
        { status: 500 },
      )
    }

    // Initialize Razorpay only when the function is called
    console.log("Initializing Razorpay...")
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const { amount, currency = "INR", receipt, notes, orderData } = await request.json()
    console.log("Payment request data:", { amount, currency, receipt, orderData })

    if (!amount || amount < 1) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    try {
      // Create a Razorpay order
      console.log("Creating Razorpay order...")
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      })
      console.log("Razorpay order created:", razorpayOrder)

      // Create an order in our database
      console.log("Creating order in database...")
      const order = await createOrder({
        userId: user.id,
        total: amount,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        razorpayOrderId: razorpayOrder.id,
      })
      console.log("Database order created:", order.id)

      const responseData = {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id, // Make sure this field is included
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      }

      console.log("Sending response:", responseData)

      return NextResponse.json(responseData)
    } catch (razorpayError: any) {
      console.error("Razorpay API error:", razorpayError)
      return NextResponse.json(
        {
          message: "Failed to create Razorpay order. Please try again later.",
          error: razorpayError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create payment order" },
      { status: error.statusCode || 500 },
    )
  }
}
