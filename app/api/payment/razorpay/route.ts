import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder } from "@/lib/orders"

// Import Razorpay but don't initialize it yet
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if environment variables are available
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: "Razorpay configuration is missing. Please contact support." },
        { status: 500 },
      )
    }

    // Initialize Razorpay only when the function is called
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const { amount, currency = "INR", receipt, notes, orderData } = await request.json()

    if (!amount || amount < 1) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // Create a Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency,
      receipt,
      notes,
    })

    // Create an order in our database - using total instead of amount
    const order = await createOrder({
      userId: user.id,
      total: amount, // Changed from amount to total
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
    })

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create payment order" },
      { status: error.statusCode || 500 },
    )
  }
}
