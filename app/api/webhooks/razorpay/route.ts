import { NextResponse } from "next/server"
import crypto from "crypto"
import { sql } from "@/lib/db"
import { updateOrderStatus } from "@/lib/orders"

export async function POST(request: Request) {
  try {
    // Check if webhook secret is available
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("Razorpay webhook secret is missing")
      return NextResponse.json({ message: "Webhook configuration error" }, { status: 500 })
    }

    const text = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json({ message: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(text)
      .digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(text)

    // Handle different event types
    switch (event.event) {
      case "payment.authorized":
        await handlePaymentAuthorized(event.payload.payment.entity)
        break
      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity)
        break
      case "refund.created":
        await handleRefundCreated(event.payload.refund.entity)
        break
      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentAuthorized(payment: any) {
  const orders = await sql`
    SELECT id FROM orders WHERE razorpay_order_id = ${payment.order_id}
  `

  if (orders.length > 0) {
    await updateOrderStatus(orders[0].id, "paid", {
      razorpay_payment_id: payment.id,
      payment_method: payment.method,
    })
  }
}

async function handlePaymentFailed(payment: any) {
  const orders = await sql`
    SELECT id FROM orders WHERE razorpay_order_id = ${payment.order_id}
  `

  if (orders.length > 0) {
    await updateOrderStatus(orders[0].id, "failed", {
      razorpay_payment_id: payment.id,
      failure_reason: payment.error_description || payment.error_code,
    })
  }
}

async function handleRefundCreated(refund: any) {
  const orders = await sql`
    SELECT id FROM orders WHERE razorpay_payment_id = ${refund.payment_id}
  `

  if (orders.length > 0) {
    await updateOrderStatus(orders[0].id, "refunded", {
      refund_id: refund.id,
      refund_amount: refund.amount / 100, // Convert from paise to INR
    })
  }
}
