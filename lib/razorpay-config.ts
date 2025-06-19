// Razorpay configuration and validation
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
}

export function validateRazorpayConfig() {
  const errors: string[] = []

  if (!razorpayConfig.keyId) {
    errors.push("RAZORPAY_KEY_ID is missing")
  }

  if (!razorpayConfig.keySecret) {
    errors.push("RAZORPAY_KEY_SECRET is missing")
  }

  if (!razorpayConfig.publicKeyId) {
    errors.push("NEXT_PUBLIC_RAZORPAY_KEY_ID is missing")
  }

  if (razorpayConfig.keyId && !razorpayConfig.keyId.startsWith("rzp_")) {
    errors.push("RAZORPAY_KEY_ID must start with 'rzp_'")
  }

  if (razorpayConfig.publicKeyId && razorpayConfig.keyId !== razorpayConfig.publicKeyId) {
    errors.push("RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID must match")
  }

  return {
    isValid: errors.length === 0,
    errors,
    isTestMode: razorpayConfig.keyId?.startsWith("rzp_test_") || false,
  }
}

export function getRazorpayInstance() {
  const validation = validateRazorpayConfig()

  if (!validation.isValid) {
    throw new Error(`Razorpay configuration invalid: ${validation.errors.join(", ")}`)
  }

  // Dynamic import to avoid bundling issues
  return import("razorpay").then((module) => {
    const Razorpay = module.default
    return new Razorpay({
      key_id: razorpayConfig.keyId!,
      key_secret: razorpayConfig.keySecret!,
    })
  })
}
