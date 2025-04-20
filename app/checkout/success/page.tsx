"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(Number(orderId))
    }
  }, [orderId])

  const fetchOrderDetails = async (id: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="text-3xl font-serif font-bold mb-4 text-center">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Thank you for your purchase. We've received your order and will begin processing it right away.
      </p>

      {orderId && (
        <div className="border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Order Details</h2>
          <p className="text-sm text-muted-foreground mb-2">Order ID: {orderId}</p>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : order ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Payment Information</h3>
                <p className="text-sm">
                  Payment Method: {order.payment_method === "razorpay" ? "Online Payment" : "Cash on Delivery"}
                </p>
                <p className="text-sm">
                  Payment Status:{" "}
                  <span
                    className={
                      order.payment_status === "paid"
                        ? "text-green-600"
                        : order.payment_status === "pending"
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  >
                    {order.payment_status === "paid"
                      ? "Paid"
                      : order.payment_status === "pending"
                        ? "Pending"
                        : "Failed"}
                  </span>
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Order Summary</h3>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{order.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items found</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Shipping Address</h3>
                {order.shipping_address ? (
                  <address className="text-sm not-italic">
                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                    <br />
                    {order.shipping_address.address}
                    <br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}
                    <br />
                    Phone: {order.shipping_address.phone}
                  </address>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipping address found</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Order details not available</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/account/orders">View My Orders</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
