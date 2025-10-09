# Advertiser Management API Testing Guide

This guide provides sample curl commands to test the advertiser management functionality.

## Prerequisites

1. **Admin Authentication**: You need to be logged in as an admin user to create/manage advertisers
2. **Advertiser Authentication**: Advertiser users need to be logged in to view their credits
3. **Base URL**: Replace `http://localhost:5000` with your actual server URL

## Authentication

First, obtain a session cookie by logging in:

```bash
# Login as admin (replace with your admin credentials)
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bakeriq.com",
    "password": "YourPassword123!"
  }' \
  -c cookies.txt

# Or use demo account (if available)
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@bakeriq.app",
    "password": "DemoPass123!"
  }' \
  -c cookies.txt
```

## 1. Create Advertiser (Admin Only)

```bash
# Create a new advertiser without user association
curl -X POST http://localhost:5000/api/admin/advertisers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "Acme Advertising Co.",
    "contactEmail": "contact@acmeads.com",
    "website": "https://acmeads.com",
    "vertical": "retail"
  }'

# Create advertiser with user association (requires existing user ID)
curl -X POST http://localhost:5000/api/admin/advertisers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "Premium Ads Inc.",
    "contactEmail": "admin@premiumads.com",
    "website": "https://premiumads.com",
    "vertical": "ecommerce",
    "userId": "existing-user-id-here"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "advertiserId": "uuid-of-new-advertiser",
  "message": "Advertiser created successfully"
}
```

## 2. Approve Advertiser (Admin Only)

After creating an advertiser, approve them to initialize their credit balance:

```bash
# Replace ADVERTISER_ID with the ID from step 1
curl -X POST http://localhost:5000/api/admin/advertisers/ADVERTISER_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Advertiser approved and credits initialized"
}
```

## 3. Add Credits to Advertiser (Admin Only)

```bash
# Add $100.00 (10000 cents) to advertiser balance
curl -X POST http://localhost:5000/api/admin/advertisers/ADVERTISER_ID/credit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt \
  -d '{
    "deltaCents": 10000,
    "reason": "Initial credit purchase",
    "campaignId": null
  }'

# Subtract credits for campaign spend
curl -X POST http://localhost:5000/api/admin/advertisers/ADVERTISER_ID/credit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt \
  -d '{
    "deltaCents": -2500,
    "reason": "Campaign delivery charge",
    "campaignId": "campaign-uuid-here"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "newBalance": 7500,
  "message": "Credits updated successfully"
}
```

## 4. Get Advertiser Credits (Advertiser-Authenticated)

```bash
# Login as advertiser user first
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "advertiser@example.com",
    "password": "AdvertiserPass123!"
  }' \
  -c advertiser_cookies.txt

# Then fetch credits
curl -X GET http://localhost:5000/api/advertisers/me/credits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b advertiser_cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "advertiserId": "advertiser-uuid",
  "balanceCents": 7500,
  "balanceDollars": "75.00"
}
```

## 5. Check Session with Advertiser ID

```bash
# Check session (works for all authenticated users)
curl -X GET http://localhost:5000/api/session \
  -b cookies.txt

# For advertiser users, this will include advertiserId
```

**Expected Response (Advertiser User):**
```json
{
  "authenticated": true,
  "userId": "user-id",
  "role": "advertiser",
  "advertiserId": "advertiser-uuid",
  "isImpersonating": false,
  "impersonatorId": null
}
```

**Expected Response (Non-Advertiser User):**
```json
{
  "authenticated": true,
  "userId": "user-id",
  "role": "admin",
  "advertiserId": null,
  "isImpersonating": false,
  "impersonatorId": null
}
```

## Testing Flow

### Complete Test Scenario

1. **Login as admin** to get session cookie
2. **Create advertiser** via POST /api/admin/advertisers
3. **Approve advertiser** via POST /api/admin/advertisers/:id/approve
4. **Add initial credits** via POST /api/admin/advertisers/:id/credit
5. **Create user association** (if not done in step 2)
6. **Login as advertiser user** to get advertiser session
7. **Check advertiser credits** via GET /api/advertisers/me/credits
8. **Verify session includes advertiserId** via GET /api/session

## Error Scenarios

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/admin/advertisers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "Test Advertiser"
  }'
```
**Response:** `400 Bad Request - Missing required fields`

### Unauthorized Access
```bash
# Try to create advertiser without admin role
curl -X POST http://localhost:5000/api/admin/advertisers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer NON_ADMIN_TOKEN" \
  -d '{
    "name": "Test",
    "contactEmail": "test@test.com"
  }'
```
**Response:** `403 Forbidden - Insufficient permissions`

### Invalid Advertiser ID
```bash
curl -X POST http://localhost:5000/api/admin/advertisers/invalid-uuid/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -b cookies.txt
```
**Response:** `404 Not Found - Advertiser not found`

## Database Schema Reference

### Tables Created
- `advertisers`: Main advertiser information
- `advertiser_users`: User-advertiser associations  
- `advertiser_credits`: Current credit balance per advertiser
- `advertiser_credits_ledger`: Audit trail of all credit transactions

### Key Concepts
- **Credits**: Stored in cents (1 dollar = 100 cents)
- **Status**: Advertisers start as 'pending', become 'active' after approval
- **Ledger**: All credit changes logged with delta, reason, and optional campaign_id
- **Balance**: Updated via ON CONFLICT upsert pattern for atomic operations

## Notes

- All credit amounts are in cents (multiply dollars by 100)
- The ledger maintains a complete audit trail of all transactions
- Advertiser approval automatically initializes credits to 0
- Only admin/super_admin roles can manage advertisers and credits
- Advertiser users must be associated via advertiser_users table
- Session endpoint now includes advertiserId for advertiser users
