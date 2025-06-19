"use client"

import { useState } from "react"
import { CheckCircle, Package, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface OrderSuccessPopupProps {
  isOpen: boolean
  onClose: () => void
  orderData: {
    id: number
    orderNumber: string
    total: number
    paymentMethod: string
    isTestMode?: boolean
  }
}

export function OrderSuccessPopup({ isOpen, onClose, orderData }: OrderSuccessPopupProps) {
  const [copied, setCopied] = useState(false)

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderData.orderNumber)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Order number copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy order number",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Number */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Your Order Number</p>
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="font-mono text-lg font-bold">{orderData.orderNumber}</span>
              <Button variant="ghost" size="sm" onClick={copyOrderNumber} className="h-8 w-8 p-0">
                <Copy className={`h-4 w-4 ${copied ? "text-green-600" : ""}`} />
              </Button>
            </div>
            {orderData.isTestMode && (
              <Badge variant="secondary" className="text-xs">
                🧪 Test Order
              </Badge>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Total:</span>
              <span className="font-semibold">₹{orderData.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">
                {orderData.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : "Razorpay"}
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-blue-900">What's Next?</p>
                <p className="text-sm text-blue-700">
                  {orderData.paymentMethod === "cash_on_delivery"
                    ? "We'll prepare your order and contact you for delivery. Pay when your order arrives!"
                    : "Your payment has been confirmed. We'll start preparing your order right away!"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => (window.location.href = "/account/orders")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Orders
            </Button>
            <Button className="flex-1" onClick={() => (window.location.href = "/shop")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
