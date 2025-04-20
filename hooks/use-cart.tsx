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
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart")

        // If the response is not OK, don't throw an error, just set empty cart
        if (!response.ok) {
          console.log("Cart fetch returned status:", response.status)
          setItems([])
          return
        }

        const data = await response.json()
        setItems(data)
      } catch (error) {
        console.error("Error fetching cart:", error)
        // Don't show error toast on initial load, just set empty cart
        setItems([])
      } finally {
        setIsInitialized(true)
      }
    }

    fetchCart()
  }, [])

  const addItem = async (productId: number, quantity = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })

      if (!response.ok) {
        const error = await response.json()

        // If unauthorized, show login prompt
        if (response.status === 401) {
          toast({
            title: "Login required",
            description: "Please log in to add items to your cart",
            variant: "destructive",
          })
          return
        }

        throw new Error(error.message || "Failed to add item to cart")
      }

      const data = await response.json()
      setItems(data)
      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart successfully.",
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

  const updateItem = async (id: number, quantity: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })

      if (!response.ok) {
        const error = await response.json()

        // If unauthorized, show login prompt
        if (response.status === 401) {
          toast({
            title: "Login required",
            description: "Please log in to update your cart",
            variant: "destructive",
          })
          return
        }

        throw new Error(error.message || "Failed to update cart item")
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
      })

      if (!response.ok) {
        const error = await response.json()

        // If unauthorized, show login prompt
        if (response.status === 401) {
          toast({
            title: "Login required",
            description: "Please log in to remove items from your cart",
            variant: "destructive",
          })
          return
        }

        throw new Error(error.message || "Failed to remove cart item")
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
      })

      if (!response.ok) {
        const error = await response.json()

        // If unauthorized, show login prompt
        if (response.status === 401) {
          toast({
            title: "Login required",
            description: "Please log in to clear your cart",
            variant: "destructive",
          })
          return
        }

        throw new Error(error.message || "Failed to clear cart")
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
