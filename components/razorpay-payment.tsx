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
    console.log("Razorpay script loaded successfully")
  }

  const handleCashOnDelivery = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: "cash_on_delivery",
          total: amount,
          email: orderData.email,
          notes: orderData.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create cash on delivery order")
      }

      const data = await response.json()

      toast({
        title: "Order placed successfully",
        description: "Your order has been placed. You can pay when the order is delivered.",
      })

      onSuccess(data.orderId || data.id)
    } catch (error: any) {
      console.error("Cash on delivery error:", error)
      onError(error.message || "Failed to place order")
    } finally {
      setIsLoading(false)
    }
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
      console.log("=== Starting Razorpay payment process ===")
      console.log("Amount:", amount)

      // Step 1: Create Razorpay order
      const response = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      })

      const data = await response.json()
      console.log("Razorpay API response:", data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payment order")
      }

      const orderId = data.razorpayOrderId || data.id
      if (!orderId) {
        throw new Error("Missing Razorpay order ID")
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay script not loaded")
      }

      console.log("Initializing Razorpay payment...")

      // Step 2: Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Virasat",
        description: "Purchase of handwoven sarees",
        order_id: orderId,
        handler: async (response: any) => {
          console.log("Payment successful:", response)
          try {
            // Step 3: Verify payment and create order
            const verifyResponse = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  ...orderData,
                  total: amount,
                },
              }),
            })

            const verifyData = await verifyResponse.json()
            console.log("Verification response:", verifyData)

            if (!verifyResponse.ok) {
              throw new Error(verifyData.message || "Payment verification failed")
            }

            toast({
              title: "Payment successful!",
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
          email: orderData.email || "",
          contact: orderData.shippingAddress.phone || "",
        },
        notes: {
          address: orderData.shippingAddress.address,
        },
        theme: {
          color: "#B45309",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed")
            setIsLoading(false)
          },
        },
      }

      console.log("Opening Razorpay payment modal...")
      const razorpay = new window.Razorpay(options)

      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        setIsLoading(false)
        onError(response.error.description || "Payment failed")
      })

      razorpay.open()
    } catch (error: any) {
      console.error("Payment initialization error:", error)
      toast({
        title: "Payment failed",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      })
      onError(error.message || "Failed to initialize payment")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={(e) => {
          console.error("Failed to load Razorpay script:", e)
          toast({
            title: "Payment gateway error",
            description: "Failed to load payment gateway. Please try Cash on Delivery.",
            variant: "destructive",
          })
        }}
      />

      <Button onClick={handlePayment} disabled={isLoading || !isScriptLoaded} className="w-full" size="lg">
        {isLoading ? "Processing..." : !isScriptLoaded ? "Loading Payment Gateway..." : "Pay with Razorpay"}
      </Button>

      <div className="text-center text-sm text-gray-500">or</div>

      <Button onClick={handleCashOnDelivery} disabled={isLoading} variant="outline" className="w-full" size="lg">
        {isLoading ? "Processing..." : "Cash on Delivery"}
      </Button>
    </div>
  )
}

// Also export as default for backward compatibility
export default RazorpayPayment
