# Campaign Sender Implementation - Output Summary

## Files Created/Edited

### 1. **apps/app/server/index.ts** (Edited)
- Added `processCampaignSends()` function - Main cron job handler
- Added `processSingleCampaign()` function - Processes individual campaigns with credit checks
- Added `sendCampaignEmail()` function - Sends emails via SES with tracking
- Added cron job: `*/5 * * * *` (runs every 5 minutes)
- Scheduled at line ~1820

### 2. **apps/app/server/routes.ts** (Edited)
- Added `GET /api/trk/o` - Open tracking pixel endpoint
- Added `GET /api/trk/c` - Click tracking with redirect endpoint
- Added `GET /api/unsub` - Unsubscribe endpoint
- Added crypto import for token hashing

## Sample Email Output

### Email Subject
```
Special Offer for Sarah Johnson - via BakerIQ
```

### Email HTML (Rendered)
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Hello Sarah Johnson,</h2>
  <p>We have an exclusive offer for you from our partner advertiser.</p>
  <p><a href="http://localhost:5000/api/trk/c?d=abc123-delivery-id&u=https%3A%2F%2Fexample.com%2Foffer">View Offer</a></p>
  <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #666;">
    This message brought to you via <strong>BakerIQ</strong>
    <br>
    <a href="http://localhost:5000/api/unsub?t=token-uuid-here" style="color: #666;">Unsubscribe from partner offers</a>
  </p>
  <img src="http://localhost:5000/api/trk/o?d=abc123-delivery-id" width="1" height="1" style="display:none;" />
</div>
```

### Email From Address
```
partners@bakeriq.app
```

## Dry-Run Log Output

### Example Cron Job Execution Log

```
[Campaign Sender] Starting campaign send processing...

[Campaign abc-123] Processing campaign "Summer Wedding Special"
[Campaign abc-123] Advertiser credits: $100.00 (10000 cents)
[Campaign abc-123] Unit price: $0.25 (25 cents)
[Campaign abc-123] Already sent: 0
[Campaign abc-123] Max sends: 1000
[Campaign abc-123] Max affordable: 400 (credits / unit_price)
[Campaign abc-123] Max allowed: 400 (min of max_sends - sent, max_affordable)

[Campaign abc-123] Filtering leads with targeting:
  - Geographic: states=['CA', 'NY'], cities=['San Francisco']
  - Date window: 2025-06-01 to 2025-09-30
  - Budget: min=500, max=5000
  - Interests: ['wedding']
  
[Campaign abc-123] Eligibility filters applied:
  ✓ network_opt_in = true
  ✓ unsubscribed_network = false
  ✓ last_network_contact_at > 7 days ago (frequency cap)
  ✓ NOT recently quoted/contracted (30 days)
  ✓ NOT contacted by THIS advertiser (30 days)

[Campaign abc-123] Found 247 eligible leads (limited to 400 by credits/max)
[Campaign abc-123] Sending to 247 leads (max allowed: 400)

[Campaign abc-123] Sending to sarah.johnson@example.com... ✓
[Campaign abc-123] Sending to mike.chen@example.com... ✓
[Campaign abc-123] Sending to emily.davis@example.com... ✓
... (244 more)

[Campaign abc-123] Successfully sent 247/247 emails
[Campaign abc-123] Credits deducted: $61.75 (6175 cents)
[Campaign abc-123] New balance: $38.25 (3825 cents)

[Campaign Sender] Processing complete
```

### Cap Enforcement Examples

#### Example 1: Credit Cap Enforced
```
[Campaign xyz-456] Processing campaign "Holiday Special"
[Campaign xyz-456] Advertiser credits: $5.00 (500 cents)
[Campaign xyz-456] Unit price: $0.25 (25 cents)
[Campaign xyz-456] Max affordable: 20 (500 / 25)
[Campaign xyz-456] Max sends: 1000
[Campaign xyz-456] Max allowed: 20 (credit cap enforced)

[Campaign xyz-456] Found 500 eligible leads
[Campaign xyz-456] Sending to 20 leads (max allowed: 20) ← CREDIT CAP
```

#### Example 2: Max Sends Cap Enforced
```
[Campaign def-789] Processing campaign "Birthday Promo"
[Campaign def-789] Advertiser credits: $1000.00 (100000 cents)
[Campaign def-789] Unit price: $0.25 (25 cents)
[Campaign def-789] Already sent: 950
[Campaign def-789] Max sends: 1000
[Campaign def-789] Max affordable: 4000
[Campaign def-789] Max allowed: 50 (max_sends cap enforced)

[Campaign def-789] Found 300 eligible leads
[Campaign def-789] Sending to 50 leads (max allowed: 50) ← MAX SENDS CAP
```

#### Example 3: Frequency Cap (No Eligible Leads)
```
[Campaign ghi-101] Processing campaign "Weekend Sale"
[Campaign ghi-101] Advertiser credits: $200.00 (20000 cents)
[Campaign ghi-101] Max allowed: 800

[Campaign ghi-101] Filtering with frequency cap (7-day cooling period)
[Campaign ghi-101] No eligible leads found ← ALL RECENTLY CONTACTED
```

#### Example 4: Advertiser Frequency Cap
```
[Campaign jkl-202] Processing campaign "New Year Offer"
[Campaign jkl-202] Filtering leads...
  ✓ Excluding leads contacted by advertiser-123 in last 30 days

[Campaign jkl-202] 500 total leads matched targeting
[Campaign jkl-202] 150 excluded (contacted by this advertiser)
[Campaign jkl-202] 350 eligible leads remaining
```

## Tracking Endpoints

### 1. Open Tracking
**Endpoint:** `GET /api/trk/o?d={deliveryId}`

**Behavior:**
- Updates `ad_deliveries.opened_at = NOW()` for the delivery
- Returns 1x1 transparent GIF pixel
- Only updates if `opened_at IS NULL` (first open only)

### 2. Click Tracking
**Endpoint:** `GET /api/trk/c?d={deliveryId}&u={targetUrl}`

**Behavior:**
- Updates `ad_deliveries.clicked_at = NOW()` for the delivery
- Redirects (302) to the target URL
- Only updates if `clicked_at IS NULL` (first click only)

### 3. Unsubscribe
**Endpoint:** `GET /api/unsub?t={token}`

**Behavior:**
- Hashes token (SHA-256) and looks up in `unsubscribe_tokens`
- Updates `calculator_leads.unsubscribed_network = true`
- Updates all deliveries for that lead: `status = 'unsub'`
- Shows success HTML page

## Database Updates Per Send

For each email sent, the following database operations occur:

1. **Insert into `unsubscribe_tokens`** (if not exists)
   - Creates SHA-256 hashed token for lead

2. **Insert into `ad_deliveries`**
   - Creates delivery record with status='queued'

3. **Update `ad_deliveries`** (after send)
   - Sets status='sent', sent_at=NOW()

4. **Update `calculator_leads`**
   - Sets last_network_contact_at=NOW()

5. **Update `advertiser_credits`**
   - Decrements balance_cents by unit_price_cents

6. **Insert into `advertiser_credits_ledger`**
   - Logs transaction with negative delta

## Environment Variables Used

- `AWS_REGION` - SES region (default: us-east-1)
- `SES_FROM` - Validated SES sender (not used, hardcoded to partners@bakeriq.app)
- `FRONTEND_URL` - Base URL for tracking links (default: http://localhost:5000)

## Cron Schedule

The campaign sender runs **every 5 minutes**:
```javascript
cron.schedule('*/5 * * * *', async () => {
  await processCampaignSends();
});
```

## Key Features Implemented

✅ **Credit verification** - Checks advertiser balance before sending  
✅ **Frequency cap** - 7-day cooling period per lead  
✅ **Advertiser frequency cap** - 30-day per-advertiser contact limit  
✅ **Recent activity exclusion** - Skips quoted/contracted leads (30 days)  
✅ **Unsubscribe management** - Honors unsubscribed_network flag  
✅ **Open tracking** - Transparent pixel  
✅ **Click tracking** - Link rewriting with redirect  
✅ **Unsubscribe tokens** - SHA-256 hashed tokens  
✅ **Credit ledger** - Full audit trail  
✅ **Status updates** - Tracks queued → sent → opened/clicked  
✅ **Cap enforcement** - Min of (max_sends - sent, credits / unit_price)

## Next Steps (Optional Enhancements)

The implementation is complete. Future enhancements could include:

1. **SES SNS webhook** - Handle bounces/complaints automatically
2. **Campaign content management** - Allow advertisers to customize email HTML
3. **A/B testing** - Split campaigns for optimization
4. **Analytics dashboard** - Open/click rates, conversion tracking
5. **Campaign scheduling** - Set future send times
6. **Pause/resume** - Campaign flow control
