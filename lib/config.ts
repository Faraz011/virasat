// Environment configuration
export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL!,
    postgresUrl: process.env.POSTGRES_URL!,
    postgresPrismaUrl: process.env.POSTGRES_PRISMA_URL!,
    databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED!,
    postgresUrlNonPooling: process.env.POSTGRES_URL_NON_POOLING!,
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },

  // App
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  },

  // Storage
  storage: {
    blobToken: process.env.BLOB_READ_WRITE_TOKEN!,
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
    isTestMode: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") || false,
  },
}

// Validation function to check if all required environment variables are set
export function validateEnvironmentVariables() {
  const requiredVars = ["DATABASE_URL", "JWT_SECRET", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env.local file and ensure all required variables are set.",
    )
  }

  // Validate Razorpay configuration
  if (config.razorpay.keyId && !config.razorpay.keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is required when RAZORPAY_KEY_ID is set")
  }

  console.log("✅ All environment variables validated successfully")
  console.log(`🔧 Razorpay mode: ${config.razorpay.isTestMode ? "TEST" : "LIVE"}`)
}
