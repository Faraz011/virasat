import Razorpay from "razorpay"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_order_74394",
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    })
  } catch (error) {
    console.error("Razorpay Error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
