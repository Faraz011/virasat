"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/components/ui/use-toast"
import { LoginReminderDialog } from "@/components/login-reminder-dialog"
import type { Product } from "@/lib/products"

interface AddToCartButtonProps {
  product: Product
  user?: any
}

export function AddToCartButton({ product, user }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { addItem, isLoading, items } = useCart()

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
    // Check if user is logged in
    if (!user) {
      setShowLoginDialog(true)
      return
    }

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
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
          {quantityInCart > 0 && user && (
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
          disabled={isLoading || isOutOfStock || (user && !canAddMore)}
        >
          {isLoading ? (
            "Adding to Cart..."
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : user && !canAddMore ? (
            "Maximum in Cart"
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
            </>
          )}
        </Button>

        {/* Additional Stock Information */}
        {!isOutOfStock && user && availableStock < 10 && (
          <p className="text-xs text-muted-foreground">
            {availableStock === 0 ? "Maximum quantity already in cart" : `${availableStock} more available to add`}
          </p>
        )}
      </div>

      {/* Login Reminder Dialog */}
      <LoginReminderDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        productName={product.name}
        action="cart"
      />
    </>
  )
}
