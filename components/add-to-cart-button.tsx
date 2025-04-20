"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/products"

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem, isLoading } = useCart()

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1)
    } else {
      toast({
        title: "Maximum stock reached",
        description: `Only ${product.stock_quantity} items available`,
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = async () => {
    if (product.stock_quantity < 1) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      })
      return
    }

    try {
      await addItem(product.id, quantity)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || isLoading || product.stock_quantity < 1}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        <Input
          type="number"
          min="1"
          max={product.stock_quantity}
          className="w-16 text-center"
          value={quantity}
          onChange={(e) => {
            const val = Number.parseInt(e.target.value)
            if (!isNaN(val) && val >= 1 && val <= product.stock_quantity) {
              setQuantity(val)
            }
          }}
          disabled={isLoading || product.stock_quantity < 1}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={increaseQuantity}
          disabled={quantity >= product.stock_quantity || isLoading || product.stock_quantity < 1}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
      <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={isLoading || product.stock_quantity < 1}>
        {isLoading ? (
          "Adding to Cart..."
        ) : product.stock_quantity < 1 ? (
          "Out of Stock"
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
          </>
        )}
      </Button>
    </div>
  )
}
