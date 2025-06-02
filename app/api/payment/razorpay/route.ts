import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrder } from "@/lib/orders"

export async function POST(request: Request) {
  try {
    console.log("=== Razorpay Payment API Called ===")

    const user = await getCurrentUser()
    console.log("Current user:", user ? `ID: ${user.id}` : "Not authenticated")

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if environment variables are available
    console.log("Checking Razorpay environment variables...")
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
    const { amount, currency = "INR", receipt, notes, orderData } = requestBody
    console.log("Payment request data:", { amount, currency, receipt, orderData })

    if (!amount || amount < 1) {
      console.error("Invalid amount:", amount)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // Import and initialize Razorpay dynamically
    let razorpay
    try {
      const Razorpay = (await import("razorpay")).default
      console.log("Razorpay module imported successfully")

      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
      console.log("Razorpay instance created successfully")
    } catch (importError: any) {
      console.error("Failed to import or initialize Razorpay:", importError)
      return NextResponse.json({ message: "Payment gateway initialization failed" }, { status: 500 })
    }

    // Create a Razorpay order
    let razorpayOrder
    try {
      console.log("Creating Razorpay order with params:", {
        amount: amount * 100,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      })

      razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      })

      console.log("Razorpay order created successfully:", {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
      })
    } catch (razorpayError: any) {
      console.error("Razorpay order creation failed:", {
        error: razorpayError.message,
        statusCode: razorpayError.statusCode,
        description: razorpayError.description,
        field: razorpayError.field,
        source: razorpayError.source,
      })

      return NextResponse.json(
        {
          message: "Failed to create payment order with Razorpay",
          error: razorpayError.description || razorpayError.message,
        },
        { status: 500 },
      )
    }

    // Create an order in our database
    let order
    try {
      console.log("Creating order in database...")
      order = await createOrder({
        userId: user.id,
        total: amount,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        razorpayOrderId: razorpayOrder.id,
      })
      console.log("Database order created successfully:", order.id)
    } catch (dbError: any) {
      console.error("Database order creation failed:", dbError)
      return NextResponse.json({ message: "Failed to create order in database" }, { status: 500 })
    }

    const responseData = {
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: keyId,
    }

    console.log("=== Sending successful response ===")
    console.log("Response data:", responseData)

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("=== Unexpected error in Razorpay API ===")
    console.error("Error:", error)
    console.error("Stack:", error.stack)

    return NextResponse.json({ message: error.message || "Failed to create payment order" }, { status: 500 })
  }
}
