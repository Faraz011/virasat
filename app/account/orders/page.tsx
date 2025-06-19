import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getUserOrders, getOrderStatusColor, canCancelOrder, canReorder } from "@/lib/orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"
import { OrderActions } from "@/components/order-actions"

export const metadata = {
  title: "Order History - Virasat",
  description: "View and manage your order history",
}

export default async function OrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const orders = await getUserOrders(user.id)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground">Track and manage all your orders</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Order #{order.order_number || order.id}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {order.payment_method === "cash_on_delivery" ? "Cash on Delivery" : "Razorpay"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <OrderActions
                      orderId={order.id}
                      status={order.status}
                      canCancel={canCancelOrder(order.status)}
                      canReorder={canReorder(order.status)}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100 flex-shrink-0">
                        <img
                          src={item.image_url || "/placeholder.svg?height=64&width=64"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium">₹{(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Shipping Address</p>
                    {order.shipping_address && (
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {order.shipping_address.firstName} {order.shipping_address.lastName}
                        </p>
                        <p>{order.shipping_address.address}</p>
                        <p>
                          {order.shipping_address.city}, {order.shipping_address.state}{" "}
                          {order.shipping_address.postalCode}
                        </p>
                        {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}`}>View Details</Link>
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Write Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
