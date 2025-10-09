# Campaign Preflight Example

## Sample Preflight JSON Response

When calling `GET /api/advertisers/campaigns/:id/preflight`, the endpoint returns:

```json
{
  "success": true,
  "eligibleCount": 247,
  "estimatedCostCents": 6175,
  "estimatedCostDollars": "61.75",
  "unitPriceCents": 25,
  "targeting": {
    "geo": {
      "states": ["CA", "NY"],
      "cities": ["San Francisco", "Los Angeles"],
      "zips": ["94102", "90001"]
    },
    "dateWindow": {
      "from": "2025-06-01",
      "to": "2025-09-30"
    },
    "budget": {
      "min": 500,
      "max": 5000
    },
    "interests": ["wedding", "birthday"]
  }
}
```

## SQL WHERE Clause (Sanitized)

The preflight endpoint builds a dynamic SQL WHERE clause based on targeting criteria. Here's the logic:

### Base Eligibility Criteria (Always Applied)

```sql
WHERE 
  -- Network consent and subscription status
  network_opt_in = true
  AND unsubscribed_network = false
  
  -- Frequency cap: 7-day cooling period
  AND (last_network_contact_at IS NULL OR (NOW() - last_network_contact_at) > INTERVAL '7 days')
```

### Geographic Targeting (If Specified)

```sql
  -- State targeting
  AND state = ANY(ARRAY['CA', 'NY']::text[])
  
  -- City targeting
  AND city = ANY(ARRAY['San Francisco', 'Los Angeles']::text[])
  
  -- Zip code targeting
  AND postal_code = ANY(ARRAY['94102', '90001']::text[])
```

### Date Window Targeting (If Specified)

```sql
  -- Event date range
  AND event_date >= '2025-06-01'
  AND event_date <= '2025-09-30'
```

### Budget Targeting (If Specified)

```sql
  -- Budget range
  AND budget_min >= 500
  AND budget_max <= 5000
```

### Interests Targeting (If Specified)

```sql
  -- Interest overlap (PostgreSQL array overlap operator)
  AND interests && ARRAY['wedding', 'birthday']::text[]
```

### Recent Activity Exclusions (Always Applied)

```sql
  -- Exclude leads with recent quotes (30 days)
  AND NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.lead_id = calculator_leads.id 
    AND quotes.created_at > NOW() - INTERVAL '30 days'
  )
  
  -- Exclude leads with recent contracts (30 days)
  AND NOT EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.lead_id = calculator_leads.id 
    AND contracts.created_at > NOW() - INTERVAL '30 days'
  )
```

## Complete Example Query

For the targeting example above, the complete SQL query would be:

```sql
SELECT COUNT(*) as count 
FROM calculator_leads 
WHERE 
  -- Base eligibility
  network_opt_in = true
  AND unsubscribed_network = false
  AND (last_network_contact_at IS NULL OR (NOW() - last_network_contact_at) > INTERVAL '7 days')
  
  -- Geographic targeting
  AND state = ANY(ARRAY['CA', 'NY']::text[])
  AND city = ANY(ARRAY['San Francisco', 'Los Angeles']::text[])
  AND postal_code = ANY(ARRAY['94102', '90001']::text[])
  
  -- Date window
  AND event_date >= '2025-06-01'
  AND event_date <= '2025-09-30'
  
  -- Budget range
  AND budget_min >= 500
  AND budget_max <= 5000
  
  -- Interests
  AND interests && ARRAY['wedding', 'birthday']::text[]
  
  -- Activity exclusions
  AND NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.lead_id = calculator_leads.id 
    AND quotes.created_at > NOW() - INTERVAL '30 days'
  )
  AND NOT EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.lead_id = calculator_leads.id 
    AND contracts.created_at > NOW() - INTERVAL '30 days'
  )
```

## Targeting JSON Schema

The targeting object follows this TypeScript interface:

```typescript
interface Targeting {
  geo?: {
    states?: string[];    // Array of state abbreviations (e.g., ["CA", "NY"])
    cities?: string[];    // Array of city names
    zips?: string[];      // Array of postal codes
  };
  dateWindow?: {
    from?: string;        // ISO date string (YYYY-MM-DD)
    to?: string;          // ISO date string (YYYY-MM-DD)
  };
  budget?: {
    min?: number;         // Minimum budget in dollars
    max?: number;         // Maximum budget in dollars
  };
  interests?: string[];   // Array of interest keywords
}
```

## API Flow Example

### 1. Create Campaign

```bash
POST /api/advertisers/campaigns
{
  "name": "Summer Wedding Campaign",
  "unitPriceCents": 25,
  "maxSends": 1000,
  "targeting": {
    "geo": {
      "states": ["CA", "NY"]
    },
    "dateWindow": {
      "from": "2025-06-01",
      "to": "2025-09-30"
    },
    "budget": {
      "min": 500,
      "max": 5000
    },
    "interests": ["wedding"]
  }
}

Response:
{
  "success": true,
  "campaignId": "uuid-here",
  "message": "Campaign created successfully"
}
```

### 2. Run Preflight

```bash
GET /api/advertisers/campaigns/{campaignId}/preflight

Response:
{
  "success": true,
  "eligibleCount": 247,
  "estimatedCostCents": 6175,
  "estimatedCostDollars": "61.75",
  "unitPriceCents": 25,
  "targeting": { ... }
}
```

### 3. Submit for Review

```bash
POST /api/advertisers/campaigns/{campaignId}/submit

Response (Success):
{
  "success": true,
  "message": "Campaign submitted for review",
  "eligibleCount": 247,
  "requiredCents": 6175,
  "balanceCents": 10000
}

Response (Insufficient Credits):
{
  "error": "Insufficient credits",
  "message": "Campaign requires 6175 cents (247 sends × 25 cents), but balance is 5000 cents",
  "requiredCents": 6175,
  "balanceCents": 5000,
  "shortfallCents": 1175
}
```

### 4. Admin Approval

```bash
POST /api/admin/campaigns/{campaignId}/approve

Response:
{
  "success": true,
  "message": "Campaign approved successfully"
}
```

## Key Features

1. **Network Consent**: Only targets leads who opted into partner offers (`network_opt_in = true`)
2. **Frequency Cap**: Ensures 7-day cooling period between network contacts
3. **Recent Activity Filter**: Excludes leads with quotes/contracts in last 30 days
4. **Credit Verification**: Ensures advertiser has sufficient credits before submission
5. **SQL Injection Protection**: All queries use parameterized statements via Drizzle ORM
6. **Flexible Targeting**: Supports geographic, temporal, budget, and interest-based targeting
7. **Real-time Count**: Preflight provides accurate eligible lead count before submission

## UI Access

Visit `/advertiser/campaigns/new` to access the campaign creation interface.
