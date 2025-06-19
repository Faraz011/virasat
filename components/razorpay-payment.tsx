"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

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
  const [isTestMode, setIsTestMode] = useState<boolean | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

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
    setDebugInfo(null)

    try {
      console.log("=== Starting Razorpay payment process ===")
      console.log("Amount:", amount)
      console.log("Order data:", orderData)

      // Step 1: Create Razorpay order
      console.log("Calling Razorpay API...")
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

      console.log("API Response status:", response.status)
      console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

      // Get response text first for debugging
      const responseText = await response.text()
      console.log("Raw API response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log("Parsed API response:", data)
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError)
        setDebugInfo(`Raw API Response: ${responseText}`)
        throw new Error("Invalid response format from payment API")
      }

      if (!response.ok) {
        console.error("API Error Response:", data)
        setDebugInfo(`API Error: ${JSON.stringify(data, null, 2)}`)
        throw new Error(data.message || `API Error: ${response.status}`)
      }

      // Check for success flag
      if (data.success === false) {
        console.error("API returned success: false", data)
        setDebugInfo(`API Response: ${JSON.stringify(data, null, 2)}`)
        throw new Error(data.message || "Payment API returned failure")
      }

      // Validate required fields
      console.log("Validating API response fields...")
      console.log("- razorpayOrderId:", data.razorpayOrderId)
      console.log("- keyId:", data.keyId ? "EXISTS" : "MISSING")
      console.log("- amount:", data.amount)

      if (!data.razorpayOrderId) {
        console.error("Missing razorpayOrderId in response:", data)
        setDebugInfo(`Missing Order ID. Full Response: ${JSON.stringify(data, null, 2)}`)
        throw new Error("Payment order creation failed. Missing Razorpay order ID.")
      }

      if (!data.keyId) {
        console.error("Missing keyId in response:", data)
        setDebugInfo(`Missing Key ID. Full Response: ${JSON.stringify(data, null, 2)}`)
        throw new Error("Payment gateway configuration error. Missing key ID.")
      }

      // Set test mode indicator
      setIsTestMode(data.isTestMode || false)

      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        console.error("Razorpay script not loaded")
        throw new Error("Payment gateway script not loaded. Please refresh and try again.")
      }

      console.log("All validations passed. Initializing Razorpay payment...")
      console.log("Mode:", data.isTestMode ? "TEST" : "LIVE")

      // Step 2: Initialize Razorpay payment
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
            // Step 3: Verify payment
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
              description: `Your order has been placed successfully. ${data.isTestMode ? "(Test Mode)" : ""}`,
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

      {isTestMode !== null && (
        <div className="flex justify-center">
          <Badge variant={isTestMode ? "secondary" : "default"}>{isTestMode ? "🧪 Test Mode" : "🔒 Live Mode"}</Badge>
        </div>
      )}

      <Button onClick={handlePayment} disabled={isLoading || !isScriptLoaded} className="w-full" size="lg">
        {isLoading ? "Processing..." : !isScriptLoaded ? "Loading Payment Gateway..." : "Pay with Razorpay"}
      </Button>

      <div className="text-center text-sm text-gray-500">or</div>

      <Button onClick={handleCashOnDelivery} disabled={isLoading} variant="outline" className="w-full" size="lg">
        {isLoading ? "Processing..." : "Cash on Delivery"}
      </Button>

      {isTestMode && (
        <div className="text-xs text-center text-gray-500 bg-yellow-50 p-2 rounded">
          💡 Test Mode: Use test card numbers for payment testing
          <br />
          Card: 4111 1111 1111 1111 | CVV: Any 3 digits | Expiry: Any future date
        </div>
      )}

      {debugInfo && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800">Debug Information:</p>
          <pre className="mt-1 text-xs overflow-auto max-h-32 text-red-700 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  )
}
