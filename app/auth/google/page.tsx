"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GoogleAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state")

    console.log("Google OAuth callback received:", { code: !!code, error, state })

    if (error) {
      console.error("Google OAuth error:", error)
      setStatus("error")
      setMessage(`Google authentication failed: ${error}`)
      return
    }

    if (!code) {
      // No code means we need to initiate OAuth
      console.log("No code found, initiating Google OAuth...")
      initiateGoogleAuth()
      return
    }

    // Handle the callback
    console.log("Processing Google OAuth callback...")
    handleGoogleCallback(code, state)
  }, [searchParams])

  const initiateGoogleAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID not found")
      setStatus("error")
      setMessage("Google OAuth is not configured. Please check environment variables.")
      return
    }

    const redirectUri = `${window.location.origin}/auth/google`
    const scope = "openid email profile"
    const state = Math.random().toString(36).substring(2, 15)

    console.log("Initiating Google OAuth with:", { clientId, redirectUri, scope, state })

    // Store state in sessionStorage for verification
    sessionStorage.setItem("google_oauth_state", state)

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${encodeURIComponent(state)}&` +
      `access_type=offline&` +
      `prompt=consent`

    console.log("Redirecting to Google OAuth URL:", authUrl)
    window.location.href = authUrl
  }

  const handleGoogleCallback = async (code: string, state: string | null) => {
    try {
      console.log("Handling Google OAuth callback...")

      // Verify state parameter
      const storedState = sessionStorage.getItem("google_oauth_state")
      console.log("State verification:", { received: state, stored: storedState })

      if (!state || state !== storedState) {
        throw new Error("Invalid state parameter - possible CSRF attack")
      }

      // Clear stored state
      sessionStorage.removeItem("google_oauth_state")

      console.log("Sending code to backend...")
      const response = await fetch("/api/auth/google/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      console.log("Backend response:", { ok: response.ok, status: response.status, data })

      if (response.ok && data.success) {
        setStatus("success")
        setMessage("Successfully authenticated with Google!")

        console.log("Authentication successful, redirecting to home...")
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 2000)
      } else {
        throw new Error(data.message || "Authentication failed")
      }
    } catch (error: any) {
      console.error("Google OAuth callback error:", error)
      setStatus("error")
      setMessage(error.message || "An error occurred during authentication")
    }
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === "error" && <AlertCircle className="h-6 w-6 text-red-600" />}
            Google Authentication
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Connecting to Google..."}
            {status === "success" && "Authentication successful!"}
            {status === "error" && "Authentication failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Please wait while we process your authentication...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-green-600">{message}</p>
              <p className="text-sm text-muted-foreground">You will be redirected to the homepage shortly...</p>
              <Button asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button onClick={initiateGoogleAuth}>Try Again</Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
