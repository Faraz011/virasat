"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Heart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/components/ui/use-toast"
import { LoginReminderDialog } from "@/components/login-reminder-dialog"
import type { Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const { addItem, isLoading } = useCart()

  // Simple authentication check by looking at the header
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check if the header shows "Account" instead of "Login"
      const accountLink = document.querySelector('a[href="/account"]')
      const loginLink = document.querySelector('a[href="/login"]')

      // If account link exists and login link doesn't, user is authenticated
      const authenticated = accountLink !== null && loginLink === null

      console.log(
        "Product card auth check - Account link exists:",
        !!accountLink,
        "Login link exists:",
        !!loginLink,
        "Authenticated:",
        authenticated,
      )

      setIsAuthenticated(authenticated)
      setAuthChecked(true)
    }

    // Check immediately
    checkAuthStatus()

    // Also check after a short delay to ensure DOM is fully loaded
    const timer = setTimeout(checkAuthStatus, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleAddToCart = async () => {
    console.log("Product card add to cart - Authenticated:", isAuthenticated, "Auth checked:", authChecked)

    // If auth hasn't been checked yet, wait
    if (!authChecked) {
      return
    }

    // Show login dialog only if user is not authenticated
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    try {
      await addItem(product.id, 1)
    } catch (error: any) {
      if (error.message.includes("Authentication required") || error.message.includes("Please log in")) {
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

  return (
    <>
      <Card className="overflow-hidden group border-0 shadow-sm h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Link href={`/product/${product.slug}`}>
            <img
              src={product.image_url || "/placeholder.svg?height=600&width=450"}
              alt={product.name}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </Link>
          {(product.is_new || product.is_sale || product.is_featured) && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium rounded">
              {product.is_new ? "New" : product.is_sale ? "Sale" : "Featured"}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 text-black rounded-full"
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground">{product.category_name}</p>
            <h3 className="font-medium line-clamp-2">
              <Link href={`/product/${product.slug}`} className="hover:underline">
                {product.name}
              </Link>
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-bold">₹{product.price.toLocaleString("en-IN")}</span>
              {product.original_price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.original_price.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < product.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({product.review_count})</span>
            </div>
          </div>
          <Button
            className="w-full mt-3"
            onClick={handleAddToCart}
            disabled={!authChecked || isLoading || product.stock_quantity < 1}
          >
            {!authChecked
              ? "Loading..."
              : isLoading
                ? "Adding..."
                : product.stock_quantity < 1
                  ? "Out of Stock"
                  : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>

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
