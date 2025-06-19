"use client"

import { useState } from "react"
import { MoreHorizontal, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface OrderActionsProps {
  orderId: number
  status: string
  canCancel: boolean
  canReorder: boolean
}

export function OrderActions({ orderId, status, canCancel, canReorder }: OrderActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to cancel order")
      }

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      })

      // Refresh the page to show updated status
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReorder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/reorder`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to reorder items")
      }

      toast({
        title: "Items Added to Cart",
        description: "All items from this order have been added to your cart.",
      })

      // Redirect to cart
      window.location.href = "/cart"
    } catch (error: any) {
      toast({
        title: "Reorder Failed",
        description: error.message || "Failed to add items to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!canCancel && !canReorder) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canCancel && (
          <DropdownMenuItem onClick={handleCancelOrder} className="text-red-600">
            <X className="h-4 w-4 mr-2" />
            Cancel Order
          </DropdownMenuItem>
        )}
        {canReorder && (
          <DropdownMenuItem onClick={handleReorder}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reorder Items
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
