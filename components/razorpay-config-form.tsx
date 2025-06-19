"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Copy, Check, AlertCircle } from "lucide-react"

interface RazorpayConfigFormProps {
  onConfigUpdate?: (config: any) => void
}

export function RazorpayConfigForm({ onConfigUpdate }: RazorpayConfigFormProps) {
  const [formData, setFormData] = useState({
    keyId: "",
    keySecret: "",
    webhookSecret: "",
  })
  const [showSecrets, setShowSecrets] = useState({
    keySecret: false,
    webhookSecret: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleSecretVisibility = (field: "keySecret" | "webhookSecret") => {
    setShowSecrets((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
      toast({
        title: "Copied!",
        description: "Environment variable copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      })
    }
  }

  const validateForm = () => {
    const errors = []

    if (!formData.keyId) {
      errors.push("Razorpay Key ID is required")
    } else if (!formData.keyId.startsWith("rzp_")) {
      errors.push("Key ID should start with 'rzp_test_' or 'rzp_live_'")
    }

    if (!formData.keySecret) {
      errors.push("Razorpay Key Secret is required")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Test the configuration
      const testResponse = await fetch("/api/payment/razorpay/test-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const testResult = await testResponse.json()

      if (!testResponse.ok) {
        throw new Error(testResult.message || "Configuration test failed")
      }

      toast({
        title: "Configuration Valid! ✅",
        description: `${testResult.isTestMode ? "Test mode" : "Live mode"} configuration is working correctly.`,
      })

      if (onConfigUpdate) {
        onConfigUpdate({
          ...formData,
          isTestMode: testResult.isTestMode,
          isValid: true,
        })
      }
    } catch (error: any) {
      console.error("Configuration test error:", error)
      toast({
        title: "Configuration Error",
        description: error.message || "Failed to validate configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isTestMode = formData.keyId.startsWith("rzp_test_")
  const isLiveMode = formData.keyId.startsWith("rzp_live_")

  const generateEnvFile = () => {
    return `# Razorpay Configuration
RAZORPAY_KEY_ID="${formData.keyId}"
RAZORPAY_KEY_SECRET="${formData.keySecret}"
${formData.webhookSecret ? `RAZORPAY_WEBHOOK_SECRET="${formData.webhookSecret}"` : '# RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"'}

# Add these to your .env.local file`
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔑 Razorpay Configuration
            {isTestMode && <Badge variant="secondary">Test Mode</Badge>}
            {isLiveMode && <Badge variant="default">Live Mode</Badge>}
          </CardTitle>
          <CardDescription>Enter your Razorpay credentials to configure the payment gateway</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Key ID */}
            <div className="space-y-2">
              <Label htmlFor="keyId">
                Razorpay Key ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="keyId"
                type="text"
                placeholder="rzp_test_xxxxxxxxxxxxxxxxxx"
                value={formData.keyId}
                onChange={(e) => handleInputChange("keyId", e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">Your public key from Razorpay Dashboard → Settings → API Keys</p>
            </div>

            {/* Key Secret */}
            <div className="space-y-2">
              <Label htmlFor="keySecret">
                Razorpay Key Secret <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="keySecret"
                  type={showSecrets.keySecret ? "text" : "password"}
                  placeholder="Your secret key here"
                  value={formData.keySecret}
                  onChange={(e) => handleInputChange("keySecret", e.target.value)}
                  className="font-mono pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleSecretVisibility("keySecret")}
                >
                  {showSecrets.keySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Your private key - keep this confidential</p>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-2">
              <Label htmlFor="webhookSecret">
                Razorpay Webhook Secret <span className="text-gray-400">(Optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="webhookSecret"
                  type={showSecrets.webhookSecret ? "text" : "password"}
                  placeholder="Webhook secret (optional)"
                  value={formData.webhookSecret}
                  onChange={(e) => handleInputChange("webhookSecret", e.target.value)}
                  className="font-mono pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleSecretVisibility("webhookSecret")}
                >
                  {showSecrets.webhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">For webhook verification (can be set up later)</p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Validating Configuration..." : "Test & Save Configuration"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      {formData.keyId && formData.keySecret && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📝 Environment Variables</CardTitle>
            <CardDescription>Add these to your .env.local file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                <pre className="whitespace-pre-wrap">{generateEnvFile()}</pre>
              </div>
              <Button variant="outline" onClick={() => copyToClipboard(generateEnvFile(), "env")} className="w-full">
                {copied === "env" ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Environment Variables
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">1. Get Razorpay Keys:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>
                • Go to{" "}
                <a
                  href="https://dashboard.razorpay.com/"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                  rel="noreferrer"
                >
                  Razorpay Dashboard
                </a>
              </li>
              <li>• Navigate to Settings → API Keys</li>
              <li>• Generate Test Keys for development</li>
              <li>• Copy Key ID and Key Secret</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Test Cards (Test Mode):</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>
                • Card Number: <code className="bg-gray-100 px-1 rounded">4111 1111 1111 1111</code>
              </li>
              <li>• CVV: Any 3 digits</li>
              <li>• Expiry: Any future date</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. After Configuration:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Copy the environment variables above</li>
              <li>• Add them to your .env.local file</li>
              <li>• Restart your development server</li>
              <li>• Test the payment flow</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
