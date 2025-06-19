"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEmailValid = /\S+@\S+\.\S+/.test(email)
  const isPasswordValid = password.length >= 6
  const isFormValid = isEmailValid && isPasswordValid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Login failed")
      }

      toast({ title: "Login successful", description: "Welcome back to Virasat!" })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-md py-12">
      <div className="space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {!isEmailValid && email && <p className="text-xs text-red-600">Please enter a valid email address</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {!isPasswordValid && password && (
              <p className="text-xs text-red-600">Password must be at least 6 characters</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? "Logging in…" : "Login"}
          </Button>
        </form>

        {/* OAuth / separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/auth/google")}
        >
          {/* Google colored G inlined to avoid external fetches */}
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img">
            <path
              fill="#EA4335"
              d="M12 10.05v3.9h5.58c-.24 1.32-.94 2.44-2 3.19l3.23 2.52c1.9-1.75 2.99-4.33 2.99-7.36 0-.69-.06-1.36-.18-2H12z"
            />
            <path
              fill="#34A853"
              d="M5.696 14.64a7.98 7.98 0 0 1 0-5.28V7.07H2.2a11.987 11.987 0 0 0 0 9.86l3.496-2.29z"
            />
            <path
              fill="#4A90E2"
              d="M12 4.9c1.72 0 3.28.6 4.5 1.78l3.37-3.37C17.95 1.24 15.19 0 12 0 7.31 0 3.26 2.69 1.11 6.63l3.58 2.78C5.7 6.4 8.6 4.9 12 4.9z"
            />
            <path
              fill="#FBBC05"
              d="M12 24c3.19 0 5.95-1.24 7.87-3.24l-3.6-2.93c-1.14.76-2.6 1.2-4.27 1.2-3.39 0-6.28-1.49-8.2-3.86L1.19 21.4C3.3 23.9 7.32 26 12 26z"
              transform="scale(0.92) translate(0 -1)"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Links */}
        <div className="text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>
        <div className="text-center text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
