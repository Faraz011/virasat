import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const envCheck = {
      razorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
      razorpayKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      razorpayWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
      keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 10) || "NOT_SET",
      isTestMode: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") || false,
      nodeEnv: process.env.NODE_ENV,
    }

    console.log("Environment check:", envCheck)

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: "Environment variables checked successfully",
    })
  } catch (error: any) {
    console.error("Environment check error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check environment",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
