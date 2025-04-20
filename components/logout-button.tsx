"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type LogoutButtonProps = React.ComponentProps<typeof Button>

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={props.variant || "outline"}
      size={props.size || "sm"}
      onClick={handleLogout}
      disabled={isLoading}
      {...props}
    >
      {isLoading
        ? "Logging out..."
        : children || (
            <>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </>
          )}
    </Button>
  )
}
