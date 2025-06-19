import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { keyId, keySecret, webhookSecret } = await request.json()

    // Validate input
    if (!keyId || !keySecret) {
      return NextResponse.json({ message: "Key ID and Key Secret are required" }, { status: 400 })
    }

    // Validate key format
    if (!keyId.startsWith("rzp_")) {
      return NextResponse.json(
        { message: "Invalid Key ID format. Should start with 'rzp_test_' or 'rzp_live_'" },
        { status: 400 },
      )
    }

    // Determine if test mode
    const isTestMode = keyId.startsWith("rzp_test_")

    // Test the configuration by creating a test order
    try {
      const Razorpay = (await import("razorpay")).default

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })

      // Create a minimal test order
      const testOrder = await razorpay.orders.create({
        amount: 100, // ₹1.00 in paise
        currency: "INR",
        receipt: `test_receipt_${Date.now()}`,
        notes: {
          test: "Configuration validation",
        },
      })

      console.log("Test order created successfully:", testOrder.id)

      return NextResponse.json({
        success: true,
        message: "Configuration is valid and working",
        isTestMode,
        testOrderId: testOrder.id,
        keyIdPrefix: keyId.substring(0, 12) + "...",
      })
    } catch (razorpayError: any) {
      console.error("Razorpay configuration test failed:", razorpayError)

      let errorMessage = "Invalid Razorpay credentials"
      if (razorpayError.error?.code === "BAD_REQUEST_ERROR") {
        errorMessage = "Invalid Key ID or Key Secret"
      } else if (razorpayError.error?.description) {
        errorMessage = razorpayError.error.description
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          error: razorpayError.error || razorpayError.message,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("Configuration test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to test configuration",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
