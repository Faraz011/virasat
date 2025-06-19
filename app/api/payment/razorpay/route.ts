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

    const requestBody = await request.json()
    const { amount, currency = "INR", receipt = `receipt_${Date.now()}` } = requestBody

    console.log("Payment request data:", { amount, currency, receipt })

    if (!amount || amount < 1) {
      console.error("Invalid amount:", amount)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // ---------------------------------------------------------------------------
    // 1) Read credentials
    // ---------------------------------------------------------------------------
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID // may exist in preview

    // ---------------------------------------------------------------------------
    // 2) If we have both keys → normal Razorpay flow
    // ---------------------------------------------------------------------------
    let order: any
    if (keyId && keySecret) {
      const Razorpay = (await import("razorpay")).default
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

      console.log("Creating live Razorpay order …")
      order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes: { user_id: user.id.toString(), timestamp: new Date().toISOString() },
      })
    } else {
      // -----------------------------------------------------------------------
      // 3) Missing credentials → sandbox stub so the demo keeps working
      // -----------------------------------------------------------------------
      console.warn("⚠️  Razorpay keys are missing – returning stub order for preview.")
      order = {
        id: `order_stub_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        receipt,
        status: "created",
        _stub: true,
      }
    }

    // ---------------------------------------------------------------------------
    // 4) Build response (works for both live & stub)
    // ---------------------------------------------------------------------------
    const responseData = {
      success: true,
      keyId: keyId || publicKey || "rzp_test_stubkey",
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      isTestMode: (keyId || publicKey || "").startsWith("rzp_test_") || !!order._stub,
    }

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
