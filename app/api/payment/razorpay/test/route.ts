import { NextResponse } from "next/server"
import { validateRazorpayConfig, getRazorpayInstance } from "@/lib/razorpay-config"

export async function GET() {
  try {
    console.log("🧪 Testing Razorpay configuration...")

    // Test configuration
    const validation = validateRazorpayConfig()

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: "Razorpay configuration invalid",
        errors: validation.errors,
      })
    }

    // Test Razorpay connection
    const razorpay = await getRazorpayInstance()

    // Create a test order with minimal amount
    const testOrder = await razorpay.orders.create({
      amount: 100, // ₹1 in paise
      currency: "INR",
      receipt: `test_${Date.now()}`,
      notes: {
        test: "true",
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Razorpay configuration is working correctly",
      testMode: validation.isTestMode,
      testOrderId: testOrder.id,
      config: {
        keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 12) + "...",
        publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 12) + "...",
        hasSecret: !!process.env.RAZORPAY_KEY_SECRET,
        hasWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
      },
    })
  } catch (error: any) {
    console.error("❌ Razorpay test failed:", error)

    return NextResponse.json({
      success: false,
      message: "Razorpay test failed",
      error: error.message,
      details: error.error || null,
    })
  }
}
