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
      // Create a cash on delivery order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: "cash_on_delivery",
          total: amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create cash on delivery order")
      }

      const data = await response.json()

      toast({
        title: "Order placed successfully",
        description: "Your order has been placed. You can pay when the order is delivered.",
      })

      onSuccess(data.orderId)
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
      console.log("=== Starting payment process ===")
      console.log("Amount:", amount)

      // Step 1: Create Razorpay order
      const response = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      })

      console.log("Payment API response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("Payment API error:", error)
        throw new Error(error.message || "Failed to create payment order")
      }

      const data = await response.json()
      console.log("Razorpay API response:", data)

      // Check for the exact field name razorpayOrderId
      if (!data.razorpayOrderId) {
        console.error("Missing razorpayOrderId in response:", data)
        throw new Error("Payment order creation failed. Please try again.")
      }

      if (!data.keyId) {
        console.error("Missing keyId in response:", data)
        throw new Error("Payment gateway configuration error")
      }

      // Check if Razorpay is available
      if (!window.Razorpay) {
        console.error("Razorpay script not loaded")
        throw new Error("Payment gateway not loaded. Please refresh and try again.")
      }

      console.log("Initializing Razorpay payment with order ID:", data.razorpayOrderId)

      // Step 2: Initialize Razorpay payment
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Virasat",
        description: "Purchase of handwoven sarees",
        order_id: data.razorpayOrderId, // Using the exact field name
        handler: async (response: any) => {
          console.log("Payment successful:", response)
          try {
            // Step 3: Verify payment and create database order
            const verifyResponse = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  ...orderData,
                  amount: amount,
                },
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

      console.log("Creating Razorpay instance with options:", {
        ...options,
        key: "HIDDEN_FOR_SECURITY",
      })

      const razorpay = new window.Razorpay(options)

      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        setIsLoading(false)
        onError(response.error.description || "Payment failed")
      })

      console.log("Opening Razorpay payment modal...")
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
