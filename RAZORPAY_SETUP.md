# Razorpay Integration Setup Guide

## 🚀 Quick Setup

### 1. Get Razorpay API Keys

#### For Test Mode (Development):
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to **Settings** → **API Keys**
4. Generate **Test Keys**
5. Copy the **Key ID** and **Key Secret**

#### For Live Mode (Production):
1. Complete KYC verification on Razorpay
2. Navigate to **Settings** → **API Keys**
3. Generate **Live Keys**
4. Copy the **Key ID** and **Key Secret**

### 2. Environment Variables Setup

Create a `.env.local` file in your project root and add:

\`\`\`env
# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_test_secret_key_here"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
\`\`\`

### 3. Test Mode vs Live Mode

The system automatically detects the mode based on your Key ID:
- **Test Mode**: Key ID starts with `rzp_test_`
- **Live Mode**: Key ID starts with `rzp_live_`

### 4. Test Card Details

For testing payments in test mode, use these card details:

#### Successful Payment:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

#### Failed Payment:
- **Card Number**: 4000 0000 0000 0002
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### 5. Webhook Setup (Optional)

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret to `RAZORPAY_WEBHOOK_SECRET`

## 🔧 Configuration Features

### Environment Validation
The system validates all required environment variables on startup and provides clear error messages if any are missing.

### Test Mode Indicator
- Shows "🧪 Test Mode" badge during test transactions
- Displays test card information for easy testing
- Logs indicate whether running in test or live mode

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Fallback to Cash on Delivery if payment fails

## 🚨 Security Notes

1. **Never commit** `.env.local` to version control
2. **Use test keys** for development
3. **Rotate keys** regularly in production
4. **Enable webhook signature verification** for production

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `RAZORPAY_KEY_ID` | ✅ | Your Razorpay Key ID (test or live) |
| `RAZORPAY_KEY_SECRET` | ✅ | Your Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | ⚠️ | Required for webhook verification |

## 🎯 Testing Checklist

- [ ] Environment variables are set
- [ ] Test mode is working
- [ ] Payment success flow works
- [ ] Payment failure is handled
- [ ] Orders are created in database
- [ ] Cart is cleared after successful payment
- [ ] Order appears in orders page
- [ ] Cash on Delivery works as fallback
