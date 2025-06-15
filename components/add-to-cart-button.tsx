"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { LoginReminderDialog } from "@/components/login-reminder-dialog"
import type { Product } from "@/lib/products"

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { addItem, isLoading, items } = useCart()
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuth()

  console.log("AddToCartButton auth state:", { isAuthenticated, authLoading })

  // Calculate how many items are already in cart for this product
  const cartItem = items.find((item) => item.product_id === product.id)
  const quantityInCart = cartItem?.quantity || 0
  const availableStock = product.stock_quantity - quantityInCart
  const maxQuantity = Math.min(product.stock_quantity, availableStock + quantity)

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    } else {
      toast({
        title: "Stock limit reached",
        description: `Only ${availableStock} more items available (${quantityInCart} already in cart)`,
        variant: "destructive",
      })
    }
  }

  const handleQuantityChange = (value: string) => {
    const val = Number.parseInt(value)
    if (!isNaN(val) && val >= 1 && val <= maxQuantity) {
      setQuantity(val)
    } else if (val > maxQuantity) {
      setQuantity(maxQuantity)
      toast({
        title: "Stock limit reached",
        description: `Only ${availableStock} more items available`,
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = async () => {
    console.log("Add to cart clicked - Auth state:", { isAuthenticated, authLoading })

    // If still loading auth, wait a moment and recheck
    if (authLoading) {
      console.log("Auth still loading, waiting...")
      return
    }

    // Double-check authentication before showing popup
    if (!isAuthenticated) {
      console.log("User not authenticated, checking auth again...")
      await checkAuth()

      // After recheck, if still not authenticated, show popup
      if (!isAuthenticated) {
        console.log("Still not authenticated after recheck, showing login dialog")
        setShowLoginDialog(true)
        return
      }
    }

    console.log("User is authenticated, proceeding with add to cart")

    if (product.stock_quantity < 1) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      })
      return
    }

    if (availableStock < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${availableStock} items available (${quantityInCart} already in cart)`,
        variant: "destructive",
      })
      return
    }

    try {
      await addItem(product.id, quantity)
      // Reset quantity to 1 after successful add
      setQuantity(1)
    } catch (error: any) {
      console.error("Add to cart error:", error)
      if (error.message.includes("Authentication required") || error.message.includes("Please log in")) {
        console.log("Auth error in add to cart, showing login dialog")
        setShowLoginDialog(true)
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart",
          variant: "destructive",
        })
      }
    }
  }

  const isOutOfStock = product.stock_quantity < 1
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0
  const canAddMore = availableStock > 0

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Stock Status Indicator */}
        <div className="flex items-center gap-2">
          {isOutOfStock ? (
            <span className="text-sm text-red-600 font-medium">Out of Stock</span>
          ) : isLowStock ? (
            <span className="text-sm text-orange-600 font-medium">Only {product.stock_quantity} left in stock</span>
          ) : (
            <span className="text-sm text-green-600 font-medium">In Stock</span>
          )}
          {quantityInCart > 0 && isAuthenticated && (
            <span className="text-sm text-muted-foreground">({quantityInCart} in cart)</span>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isLoading || isOutOfStock}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <Input
            type="number"
            min="1"
            max={maxQuantity}
            className="w-16 text-center"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            disabled={isLoading || isOutOfStock}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={increaseQuantity}
            disabled={quantity >= maxQuantity || isLoading || isOutOfStock}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock || (isAuthenticated && !canAddMore)}
        >
          {authLoading ? (
            "Checking..."
          ) : isLoading ? (
            "Adding to Cart..."
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : isAuthenticated && !canAddMore ? (
            "Maximum in Cart"
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
            </>
          )}
        </Button>

        {/* Additional Stock Information */}
        {!isOutOfStock && isAuthenticated && availableStock < 10 && (
          <p className="text-xs text-muted-foreground">
            {availableStock === 0 ? "Maximum quantity already in cart" : `${availableStock} more available to add`}
          </p>
        )}
      </div>

      {/* Login Reminder Dialog - Only shows when not authenticated */}
      <LoginReminderDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        productName={product.name}
        action="cart"
      />
    </>
  )
}
