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
      console.log("Creating payment order with amount:", amount)
      console.log("Order data:", orderData)

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

      console.log("Payment API response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("Payment API error:", error)
        throw new Error(error.message || "Failed to create payment order")
      }

      const data = await response.json()
      console.log("Payment order created:", data)

      // Check if we have the required data
      if (!data.keyId) {
        console.error("Missing keyId in response:", data)
        throw new Error("Payment gateway key is missing. Please contact support.")
      }

      // Check for razorpayOrderId - this is the field that was missing
      if (!data.razorpayOrderId) {
        console.error("Missing razorpayOrderId in response:", data)

        // Try to use id field if available (some Razorpay implementations use different field names)
        if (data.id) {
          console.log("Using data.id as razorpayOrderId:", data.id)
          data.razorpayOrderId = data.id
        } else {
          throw new Error("Payment order ID is missing. Please contact support.")
        }
      }

      // Check if Razorpay is available
      if (!window.Razorpay) {
        console.error("Razorpay script not loaded")
        throw new Error("Payment gateway not loaded. Please refresh and try again.")
      }

      console.log("Initializing Razorpay with options...")

      // Initialize Razorpay payment
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Virasat",
        description: "Purchase of handwoven sarees",
        order_id: data.razorpayOrderId,
        handler: async (response: any) => {
          console.log("Payment successful:", response)
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

            onSuccess(verifyData.orderId || data.orderId)
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
          color: "#B45309", // Primary color (amber-700)
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
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={(e) => {
          console.error("Failed to load Razorpay script:", e)
          toast({
            title: "Payment gateway error",
            description: "Failed to load payment gateway. Please refresh and try again.",
            variant: "destructive",
          })
        }}
      />
      <Button onClick={handlePayment} disabled={isLoading || !isScriptLoaded} className="w-full" size="lg">
        {isLoading ? "Processing..." : !isScriptLoaded ? "Loading Payment Gateway..." : "Pay with Razorpay"}
      </Button>
    </>
  )
}
