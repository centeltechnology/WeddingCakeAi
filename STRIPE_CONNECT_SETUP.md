# Stripe Connect Platform Setup

The "Platform Configuration Required" error means your Stripe Connect platform needs configuration on the Stripe Dashboard.

## Required Steps:

### 1. Complete Platform Profile
1. Go to [Stripe Connect Settings](https://dashboard.stripe.com/connect/accounts/overview)
2. Click "Settings" → "Connect Platform Profile"
3. Fill in all required fields:
   - Business name: "Bakewise"
   - Business website: "https://bakeriq.app"
   - Business description: "Wedding cake marketplace platform"
   - Support email and phone
   - Business address

### 2. Configure Webhook Endpoints
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://bakeriq.app/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `account.updated`
   - `account.application.deauthorized`

### 3. Set Redirect URLs
1. In Connect settings, add:
   - **Redirect URI**: `https://bakeriq.app/baker-dashboard`
   - **Refresh URL**: `https://bakeriq.app/baker-dashboard?refresh=true`

### 4. Enable Express Accounts
1. Go to Connect → Settings
2. Enable "Express accounts"
3. Set required capabilities:
   - Card payments
   - Transfers

### 5. Platform Policy URLs
1. Set Terms of Service URL
2. Set Privacy Policy URL
3. Set Support URL

## Test in Development:
- Use your development domain for webhook URLs during testing
- Switch to production URLs when going live

## Common Issues:
- **"Verification Required"**: Complete business verification in Stripe Dashboard
- **"Invalid Platform"**: Ensure all platform profile fields are completed
- **"Webhook Failed"**: Check webhook endpoint is accessible and returns 200

Once these are configured, the Stripe Connect onboarding will work properly.