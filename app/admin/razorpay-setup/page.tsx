"use client"

import { useState } from "react"
import { RazorpayConfigForm } from "@/components/razorpay-config-form"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

export default function RazorpaySetupPage() {
  const [configStatus, setConfigStatus] = useState<any>(null)

  const handleConfigUpdate = (config: any) => {
    setConfigStatus(config)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Razorpay Setup</h1>
        <p className="text-gray-600">Configure your Razorpay payment gateway</p>
      </div>

      {configStatus?.isValid && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Configuration Successful!</span>
              <Badge variant={configStatus.isTestMode ? "secondary" : "default"}>
                {configStatus.isTestMode ? "Test Mode" : "Live Mode"}
              </Badge>
            </div>
            <p className="text-sm text-green-600 mt-1">Your Razorpay configuration is valid and ready to use.</p>
          </CardContent>
        </Card>
      )}

      <RazorpayConfigForm onConfigUpdate={handleConfigUpdate} />
    </div>
  )
}
