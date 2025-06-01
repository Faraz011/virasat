"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/components/ui/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { items, updateItem, removeItem, clearCart, isLoading } = useCart()
  const [subtotal, setSubtotal] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    // Calculate subtotal
    const newSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setSubtotal(newSubtotal)

    // Calculate shipping (free for orders over ₹5000)
    const newShipping = newSubtotal > 5000 ? 0 : 150
    setShipping(newShipping)

    // Calculate total
    setTotal(newSubtotal + newShipping)
  }, [items])

  const handleQuantityChange = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      await updateItem(id, newQuantity)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (id: number) => {
    try {
      await removeItem(id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out",
        variant: "destructive",
      })
      return
    }
    router.push("/checkout")
  }

  return (
    <div className="container py-6 md:py-8 px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">Your Cart</h1>
        <p className="text-muted-foreground">Review and modify your items before checkout</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 hidden md:block">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-6">
                        <div className="flex gap-4 items-center">
                          <div className="h-20 w-16 overflow-hidden rounded-md flex-shrink-0">
                            <img
                              src={item.image_url || "/placeholder.svg?height=80&width=64"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">
                              <Link href={`/product/${item.slug}`} className="hover:underline">
                                {item.name}
                              </Link>
                            </h3>
                            <div className="flex justify-between items-center mt-1 md:hidden">
                              <span className="text-sm">₹{item.price.toLocaleString("en-IN")}</span>
                              <span className="text-sm font-medium">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 mt-1"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:block md:col-span-2 text-center">
                        ₹{item.price.toLocaleString("en-IN")}
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-start md:justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            className="w-12 h-7 text-center p-1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Number.parseInt(e.target.value)
                              if (!isNaN(val) && val >= 1) {
                                handleQuantityChange(item.id, val)
                              }
                            }}
                            disabled={isLoading}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                          </Button>
                        </div>
                      </div>
                      <div className="hidden md:block md:col-span-2 text-right font-medium">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button variant="outline" onClick={handleClearCart} disabled={isLoading} className="w-full sm:w-auto">
                Clear Cart
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border p-4 md:p-6 space-y-4">
              <h2 className="text-lg font-medium">Order Summary</h2>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={items.length === 0 || isLoading}>
                Proceed to Checkout
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Taxes calculated at checkout. Free shipping on orders over ₹5,000.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
