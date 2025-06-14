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
  isAuthenticated: boolean
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  isLoading: false,
  isAuthenticated: false,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart")

        if (response.status === 401) {
          // User is not authenticated
          setIsAuthenticated(false)
          setItems([])
          return
        }

        if (!response.ok) {
          console.log("Cart fetch returned status:", response.status)
          setItems([])
          return
        }

        const data = await response.json()
        setItems(data)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error fetching cart:", error)
        setItems([])
        setIsAuthenticated(false)
      } finally {
        setIsInitialized(true)
      }
    }

    fetchCart()
  }, [])

  const addItem = async (productId: number, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required")
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false)
          throw new Error("Please log in to add items to your cart")
        }

        if (response.status === 400 && data.message) {
          throw new Error(data.message)
        }

        throw new Error(data.message || "Failed to add item to cart")
      }

      setItems(data)
      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart successfully.",
      })
    } catch (error: any) {
      throw error // Re-throw to be handled by the component
    } finally {
      setIsLoading(false)
    }
  }

  const updateItem = async (id: number, quantity: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to update your cart",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false)
          toast({
            title: "Login required",
            description: "Please log in to update your cart",
            variant: "destructive",
          })
          return
        }

        if (response.status === 400 && data.message) {
          toast({
            title: "Stock Error",
            description: data.message,
            variant: "destructive",
          })
          // Refresh cart to get current state
          const cartResponse = await fetch("/api/cart")
          if (cartResponse.ok) {
            const cartData = await cartResponse.json()
            setItems(cartData)
          }
          return
        }

        throw new Error(data.message || "Failed to update cart item")
      }

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
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to remove items from your cart",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()

        if (response.status === 401) {
          setIsAuthenticated(false)
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
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to clear your cart",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()

        if (response.status === 401) {
          setIsAuthenticated(false)
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
    <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clearCart, isLoading, isAuthenticated }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
