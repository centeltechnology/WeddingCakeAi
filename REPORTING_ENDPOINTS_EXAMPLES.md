# Reporting Endpoints - Example JSON Responses

## 1. Advertiser Summary Report

**Endpoint:** `GET /api/advertisers/reports/summary?from=...&to=...`

**Authentication:** Required (JWT with `advertiser` role)

**Query Parameters:**
- `from` (optional): ISO 8601 date string (e.g., `2025-01-01`)
- `to` (optional): ISO 8601 date string (e.g., `2025-01-31`)

### Example Request

```bash
GET /api/advertisers/reports/summary?from=2025-01-01&to=2025-01-31
Authorization: Bearer <jwt_token>
```

### Example Response

```json
{
  "sends": 1247,
  "opens": 523,
  "clicks": 189,
  "unsubscribes": 12,
  "spendCents": 31175
}
```

**Field Descriptions:**
- `sends`: Total number of emails delivered
- `opens`: Total number of unique opens (first open only)
- `clicks`: Total number of unique clicks (first click only)
- `unsubscribes`: Total number of unsubscribes
- `spendCents`: Total amount spent in cents ($311.75 in this example)

**Calculated Rates (Frontend):**
- Open Rate: `(opens / sends) * 100` = 41.94%
- Click Rate: `(clicks / sends) * 100` = 15.16%
- Unsub Rate: `(unsubscribes / sends) * 100` = 0.96%

---

## 2. Admin Network Report

**Endpoint:** `GET /api/admin/reports/network`

**Authentication:** Required (JWT with `admin` or `super_admin` role)

**Query Parameters:** None

### Example Request

```bash
GET /api/admin/reports/network
Authorization: Bearer <jwt_token>
```

### Example Response

```json
{
  "topAdvertisers": [
    {
      "advertiserId": "adv-001",
      "companyName": "Sweet Dreams Bakery Supply",
      "totalSpendCents": 125000,
      "totalSends": 5000
    },
    {
      "advertiserId": "adv-002",
      "companyName": "Wedding Cake Toppers Inc",
      "totalSpendCents": 89500,
      "totalSends": 3580
    },
    {
      "advertiserId": "adv-003",
      "companyName": "Artisan Fondant Co",
      "totalSpendCents": 67200,
      "totalSends": 2688
    }
  ],
  "topGeos": [
    {
      "state": "CA",
      "city": "Los Angeles",
      "sends": 1842
    },
    {
      "state": "NY",
      "city": "New York",
      "sends": 1523
    },
    {
      "state": "TX",
      "city": "Houston",
      "sends": 1204
    },
    {
      "state": "CA",
      "city": "San Francisco",
      "sends": 987
    },
    {
      "state": "IL",
      "city": "Chicago",
      "sends": 856
    }
  ],
  "networkStats": {
    "totalSends": 12450,
    "totalUnsubs": 142,
    "totalOpens": 5234,
    "totalClicks": 1876,
    "unsubRate": "1.14",
    "openRate": "42.04",
    "clickRate": "15.07"
  }
}
```

**Field Descriptions:**

### topAdvertisers
- `advertiserId`: Unique advertiser ID
- `companyName`: Advertiser's company name
- `totalSpendCents`: Total lifetime spend in cents
- `totalSends`: Total number of emails sent

### topGeos
- `state`: Two-letter state code
- `city`: City name
- `sends`: Number of emails sent to this location

### networkStats
- `totalSends`: Network-wide total sends
- `totalUnsubs`: Network-wide total unsubscribes
- `totalOpens`: Network-wide total opens
- `totalClicks`: Network-wide total clicks
- `unsubRate`: Unsubscribe percentage (string formatted to 2 decimals)
- `openRate`: Open percentage (string formatted to 2 decimals)
- `clickRate`: Click-through percentage (string formatted to 2 decimals)

---

## UI Pages

### Advertiser Reports Page
**Route:** `/advertiser/reports`

Features:
- Date range picker (from/to)
- Summary cards showing:
  - Emails Sent (total count)
  - Opens (count + percentage)
  - Clicks (count + CTR percentage)
  - Unsubscribes (count + percentage)
  - Total Spend (formatted as currency)

### Admin Network Reports Page
**Route:** `/admin/reports/network`

Features:
- Network-wide stats cards:
  - Total Sends
  - Open Rate (with total opens)
  - Click Rate (with total clicks)
  - Unsubscribe Rate (with total unsubs)
- Top Advertisers table (by spend)
- Top Geos table (by deliveries)

---

## Notes

- All dates are in ISO 8601 format
- All monetary amounts are in cents (divide by 100 for dollars)
- Rates are calculated on the backend for network stats
- Rates are calculated on the frontend for advertiser summary (for flexibility)
- The advertiser summary endpoint filters by the authenticated advertiser's ID
- The admin network report shows aggregate data across all advertisers
