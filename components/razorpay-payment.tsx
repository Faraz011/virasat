"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface RazorpayPaymentProps {
  amount: number
  orderData: any
  onSuccess: (orderId: number) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayPayment({ amount, orderData, onSuccess, onError }: RazorpayPaymentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  const handleScriptLoad = () => {
    setIsScriptLoaded(true)
  }

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast({
        title: "Payment gateway loading",
        description: "Please wait while we initialize the payment gateway.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create order on the server
      const response = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            shipping_address: JSON.stringify(orderData.shippingAddress),
          },
          orderData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create payment order")
      }

      const data = await response.json()

      // Check if we have the required data
      if (!data.keyId || !data.razorpayOrderId) {
        throw new Error("Payment gateway configuration is incomplete. Please contact support.")
      }

      // Initialize Razorpay payment
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Virasat",
        description: "Purchase of handwoven sarees",
        order_id: data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment signature
            const verifyResponse = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json()
              throw new Error(error.message || "Payment verification failed")
            }

            const verifyData = await verifyResponse.json()

            toast({
              title: "Payment successful",
              description: "Your order has been placed successfully.",
            })

            onSuccess(verifyData.orderId)
          } catch (error: any) {
            console.error("Payment verification error:", error)
            onError(error.message || "Payment verification failed")
          }
        },
        prefill: {
          name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
          email: orderData.email,
          contact: orderData.shippingAddress.phone,
        },
        notes: {
          address: orderData.shippingAddress.address,
        },
        theme: {
          color: "#B45309", // Primary color (amber-700)
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        onError(response.error.description || "Payment failed")
      })
    } catch (error: any) {
      console.error("Payment initialization error:", error)
      toast({
        title: "Payment failed",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      })
      onError(error.message || "Failed to initialize payment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={handleScriptLoad} />
      <Button onClick={handlePayment} disabled={isLoading || !isScriptLoaded} className="w-full" size="lg">
        {isLoading ? "Processing..." : "Pay with Razorpay"}
      </Button>
    </>
  )
}
