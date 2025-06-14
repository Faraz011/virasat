"use client"
import Link from "next/link"
import { User, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LoginReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName?: string
  action?: "cart" | "checkout" | "wishlist"
}

export function LoginReminderDialog({ open, onOpenChange, productName, action = "cart" }: LoginReminderDialogProps) {
  const actionText = {
    cart: "add items to your cart",
    checkout: "proceed to checkout",
    wishlist: "save items to your wishlist",
  }

  const actionIcon = {
    cart: <ShoppingBag className="h-5 w-5" />,
    checkout: <ShoppingBag className="h-5 w-5" />,
    wishlist: <ShoppingBag className="h-5 w-5" />,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Login Required
          </DialogTitle>
          <DialogDescription className="text-left">
            {productName ? (
              <>
                To {actionText[action]} <span className="font-medium">"{productName}"</span>, please sign in to your
                account or create a new one.
              </>
            ) : (
              <>To {actionText[action]}, please sign in to your account or create a new one.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button asChild className="w-full">
            <Link href="/login" onClick={() => onOpenChange(false)}>
              {actionIcon[action]}
              Sign In
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/register" onClick={() => onOpenChange(false)}>
              <User className="h-4 w-4 mr-2" />
              Create Account
            </Link>
          </Button>

          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Continue Browsing
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Why sign in?</strong>
          </p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
            <li>• Save items in your cart</li>
            <li>• Track your orders</li>
            <li>• Faster checkout</li>
            <li>• Exclusive member offers</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
