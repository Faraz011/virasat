"use client"

import type React from "react"
import { useState } from "react"

interface RazorpayPaymentProps {
  amount: number
  currency: string
  receiptId: string
  onSuccess: () => void
  onError: () => void
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ amount, currency, receiptId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    const res = await loadRazorpay()

    if (!res) {
      alert("Razorpay SDK failed to load. Check your internet connection.")
      setLoading(false)
      onError()
      return
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      currency: currency,
      amount: amount * 100,
      name: "Acme Corp",
      description: "Payment for services",
      image: "/logo.png",
      order_id: receiptId,
      handler: (response: any) => {
        // Handle successful payment
        onSuccess()
      },
      prefill: {
        name: "John Doe",
        email: "john.doe@example.com",
        contact: "9999999999",
      },
    }

    const paymentObject = new (window as any).Razorpay(options)
    paymentObject.open()
    paymentObject.on("payment.failed", (response: any) => {
      // Handle payment failure
      onError()
    })

    setLoading(false)
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? "Processing..." : "Pay with Razorpay"}
    </button>
  )
}

export default RazorpayPayment
