"use client"

import { useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Truck } from "lucide-react"

interface RazorpayPaymentProps {
  amount: number
  orderData: {
    items: any[]
    shippingAddress: any
    email?: string
    total: number
  }
  onSuccess: (orderId: number) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayPayment({ amount, orderData, onSuccess, onError }: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod" | null>(null)

  // Load Razorpay script
  const handleScriptLoad = () => {
    setIsScriptLoaded(true)
    console.log("✅ Razorpay script loaded successfully")
  }

  const handleScriptError = () => {
    console.error("❌ Failed to load Razorpay script")
    toast({
      title: "Payment Gateway Error",
      description: "Failed to load payment gateway. Please try Cash on Delivery.",
      variant: "destructive",
    })
  }

  // Cash on Delivery handler
  const handleCashOnDelivery = async () => {
    setIsLoading(true)
    setPaymentMethod("cod")

    try {
      console.log("🚚 Processing Cash on Delivery order...")

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
          paymentStatus: "pending",
          total: amount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create order")
      }

      const data = await response.json()
      console.log("✅ Cash on Delivery order created:", data.orderId || data.id)

      toast({
        title: "Order Placed Successfully! 🎉",
        description: "Your order has been placed. Pay when delivered to your doorstep.",
      })

      onSuccess(data.orderId || data.id)
    } catch (error: any) {
      console.error("❌ Cash on Delivery error:", error)
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      })
      onError(error.message || "Failed to place order")
    } finally {
      setIsLoading(false)
      setPaymentMethod(null)
    }
  }

  // Razorpay payment handler
  const handleRazorpayPayment = async () => {
    if (!isScriptLoaded) {
      toast({
        title: "Payment Gateway Loading",
        description: "Please wait while we initialize the payment gateway...",
      })
      return
    }

    setIsLoading(true)
    setPaymentMethod("razorpay")

    try {
      console.log("💳 Starting Razorpay payment process...")
      console.log("- Amount:", amount)
      console.log("- Items count:", orderData.items.length)

      // Step 1: Create Razorpay order
      console.log("📝 Creating Razorpay order...")
      const orderResponse = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
        }),
      })

      console.log("📋 Order API response status:", orderResponse.status)

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        console.error("❌ Order API error:", errorData)
        throw new Error(errorData.message || errorData.error || `Payment API returned status ${orderResponse.status}`)
      }

      const orderData_response = await orderResponse.json()
      console.log("📋 Order creation response:", orderData_response)

      // Step 2: Validate the response
      if (!orderData_response.success) {
        console.error("❌ API returned success: false", orderData_response)
        throw new Error(orderData_response.message || "Payment order creation failed")
      }

      // Extract the order ID - Razorpay expects 'id' field
      const razorpayOrderId = orderData_response.id || orderData_response.orderId
      if (!razorpayOrderId) {
        console.error("❌ Missing order ID in response:", orderData_response)
        throw new Error("Invalid response from payment gateway - missing order ID")
      }

      if (!orderData_response.keyId) {
        console.error("❌ Missing keyId in response:", orderData_response)
        throw new Error("Invalid response from payment gateway - missing key ID")
      }

      console.log("✅ Order validation passed:")
      console.log("- Order ID:", razorpayOrderId)
      console.log("- Key ID:", orderData_response.keyId)
      console.log("- Amount:", orderData_response.amount)

      // Step 3: Check if Razorpay is available
      if (!window.Razorpay) {
        throw new Error("Razorpay payment gateway not loaded")
      }

      console.log("🚀 Opening Razorpay payment modal...")

      // Step 4: Configure Razorpay options
      const razorpayOptions = {
        key: orderData_response.keyId,
        amount: orderData_response.amount,
        currency: orderData_response.currency || "INR",
        name: "Virasat",
        description: "Handwoven Sarees & Traditional Wear",
        order_id: razorpayOrderId, // This is the critical field
        handler: async (response: any) => {
          console.log("✅ Payment successful:", response)
          await handlePaymentSuccess(response)
        },
        prefill: {
          name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
          email: orderData.email || "",
          contact: orderData.shippingAddress.phone || "",
        },
        notes: {
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
        },
        theme: {
          color: "#B45309",
        },
        modal: {
          ondismiss: () => {
            console.log("💭 Payment modal dismissed by user")
            setIsLoading(false)
            setPaymentMethod(null)
          },
        },
      }

      console.log("🔧 Razorpay options configured:", {
        ...razorpayOptions,
        key: "HIDDEN_FOR_SECURITY",
      })

      // Step 5: Create and open Razorpay instance
      const razorpay = new window.Razorpay(razorpayOptions)

      razorpay.on("payment.failed", (response: any) => {
        console.error("❌ Payment failed:", response.error)
        setIsLoading(false)
        setPaymentMethod(null)

        toast({
          title: "Payment Failed",
          description: response.error.description || "Payment was not successful",
          variant: "destructive",
        })

        onError(response.error.description || "Payment failed")
      })

      razorpay.open()
    } catch (error: any) {
      console.error("❌ Razorpay payment error:", error)
      setIsLoading(false)
      setPaymentMethod(null)

      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      })

      onError(error.message || "Failed to initialize payment")
    }
  }

  // Handle successful payment
  const handlePaymentSuccess = async (razorpayResponse: any) => {
    try {
      console.log("🔐 Verifying payment...")

      const verificationResponse = await fetch("/api/payment/razorpay/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          orderData: {
            ...orderData,
            total: amount,
          },
        }),
      })

      const verificationData = await verificationResponse.json()
      console.log("🔐 Verification response:", verificationData)

      if (!verificationResponse.ok || !verificationData.success) {
        throw new Error(verificationData.message || "Payment verification failed")
      }

      console.log("✅ Payment verified and order created:", verificationData.orderId)

      toast({
        title: "Payment Successful! 🎉",
        description: `Your order has been placed successfully. ${verificationData.isTestMode ? "(Test Mode)" : ""}`,
      })

      onSuccess(verificationData.orderId)
    } catch (error: any) {
      console.error("❌ Payment verification error:", error)

      toast({
        title: "Payment Verification Failed",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      })

      onError(error.message || "Payment verification failed")
    } finally {
      setIsLoading(false)
      setPaymentMethod(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />

      {/* Payment Amount Display */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Total Amount</p>
        <p className="text-2xl font-bold text-gray-900">₹{amount.toLocaleString()}</p>
      </div>

      {/* Payment Buttons */}
      <div className="space-y-4">
        {/* Razorpay Payment Button */}
        <Button
          onClick={handleRazorpayPayment}
          disabled={isLoading || !isScriptLoaded}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isLoading && paymentMethod === "razorpay" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : !isScriptLoaded ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading Payment Gateway...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pay with Razorpay
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        {/* Cash on Delivery Button */}
        <Button
          onClick={handleCashOnDelivery}
          disabled={isLoading}
          variant="outline"
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isLoading && paymentMethod === "cod" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <Truck className="mr-2 h-5 w-5" />
              Cash on Delivery
            </>
          )}
        </Button>
      </div>

      {/* Test Mode Information */}
      {isScriptLoaded && (
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            🧪 Test Mode - Use test cards for payment
          </Badge>
          <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded">
            <p className="font-medium">Test Card Details:</p>
            <p>Card: 4111 1111 1111 1111</p>
            <p>CVV: Any 3 digits | Expiry: Any future date</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Export both named and default
export default RazorpayPayment
