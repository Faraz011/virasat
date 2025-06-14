"use client"

import { useRouter } from "next/navigation"
import { User, ShoppingBag, Heart, CreditCard, Gift } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LoginReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName?: string
  action?: "cart" | "checkout" | "wishlist" | "purchase"
}

export function LoginReminderDialog({ open, onOpenChange, productName, action = "cart" }: LoginReminderDialogProps) {
  const router = useRouter()

  const actionConfig = {
    cart: {
      title: "Sign in to Add to Cart",
      description: "add items to your cart",
      icon: <ShoppingBag className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
    },
    checkout: {
      title: "Sign in to Checkout",
      description: "proceed to checkout",
      icon: <CreditCard className="h-6 w-6 text-green-600" />,
      color: "bg-green-50 border-green-200",
    },
    wishlist: {
      title: "Sign in to Save Items",
      description: "save items to your wishlist",
      icon: <Heart className="h-6 w-6 text-red-600" />,
      color: "bg-red-50 border-red-200",
    },
    purchase: {
      title: "Sign in to Purchase",
      description: "complete your purchase",
      icon: <Gift className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-200",
    },
  }

  const config = actionConfig[action]

  const handleSignIn = () => {
    onOpenChange(false)
    router.push("/login")
  }

  const handleCreateAccount = () => {
    onOpenChange(false)
    router.push("/register")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className={`mx-auto mb-4 p-3 rounded-full ${config.color} border-2`}>{config.icon}</div>
          <DialogTitle className="text-xl font-bold text-gray-900">{config.title}</DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            {productName ? (
              <>
                To {config.description} for <span className="font-semibold text-gray-900">"{productName}"</span>, please
                sign in to your account.
              </>
            ) : (
              <>To {config.description}, please sign in to your account.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={handleSignIn} className="w-full h-12 text-base font-medium" size="lg">
            <User className="h-5 w-5 mr-2" />
            Sign In to Continue
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateAccount}
            className="w-full h-12 text-base font-medium border-2"
            size="lg"
          >
            <User className="h-5 w-5 mr-2" />
            Create New Account
          </Button>

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 text-sm text-gray-600 hover:text-gray-900"
          >
            Continue Browsing
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Why create an account?</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  Save items in your cart across devices
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  Track your orders and delivery status
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  Faster checkout with saved addresses
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  Exclusive member offers and early access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
