"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

type CartItem = {
  id: number
  product_id: number
  quantity: number
  name: string
  price: number
  original_price: number | null
  image_url: string
  slug: string
  stock_quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (id: number, quantity: number) => Promise<void>
  removeItem: (id: number) => Promise<void>
  clearCart: () => Promise<void>
  isLoading: boolean
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  isLoading: false,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch cart items on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setItems(data)
        } else {
          // If not authenticated, just set empty cart
          setItems([])
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
        setItems([])
      }
    }

    fetchCart()
  }, [])

  const addItem = async (productId: number, quantity = 1) => {
    setIsLoading(true)
    try {
      console.log("Adding item to cart:", { productId, quantity })

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId, quantity }),
      })

      console.log("Add to cart response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("Add to cart error response:", errorData)

        if (response.status === 401) {
          throw new Error("Authentication required")
        }

        throw new Error(errorData.message || "Failed to add item to cart")
      }

      const data = await response.json()
      console.log("Add to cart success:", data)
      setItems(data)

      // Don't show toast here, let the component handle it
    } catch (error: any) {
      console.error("Cart addItem error:", error)
      throw error // Re-throw to be handled by the component
    } finally {
      setIsLoading(false)
    }
  }

  const updateItem = async (id: number, quantity: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 401) {
          toast({
            title: "Login required",
            description: "Please log in to update your cart",
            variant: "destructive",
          })
          return
        }

        if (response.status === 400 && errorData.message) {
          toast({
            title: "Stock Error",
            description: errorData.message,
            variant: "destructive",
          })
          // Refresh cart to get current state
          const cartResponse = await fetch("/api/cart", { credentials: "include" })
          if (cartResponse.ok) {
            const cartData = await cartResponse.json()
            setItems(cartData)
          }
          return
        }

        throw new Error(errorData.message || "Failed to update cart item")
      }

      const data = await response.json()
      setItems(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (id: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 401) {
          toast({
            title: "Login required",
            description: "Please log in to remove items from your cart",
            variant: "destructive",
          })
          return
        }

        throw new Error(errorData.message || "Failed to remove cart item")
      }

      const data = await response.json()
      setItems(data)
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 401) {
          toast({
            title: "Login required",
            description: "Please log in to clear your cart",
            variant: "destructive",
          })
          return
        }

        throw new Error(errorData.message || "Failed to clear cart")
      }

      setItems([])
      toast({
        title: "Cart cleared",
        description: "Your cart has been cleared successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clearCart, isLoading }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
