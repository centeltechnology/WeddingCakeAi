# BakerIQ Backend Error Log

**Generated:** October 10, 2025  
**Test Session:** 5:34 PM - 5:52 PM

---

## 🔴 CRITICAL ERRORS

### 1. Quote Approval System Crash (500 Error)
**Location:** `apps/app/server/routes.ts:3886`  
**Error Type:** ReferenceError  
**Request:** `POST /api/quotes/8d96b37c-3b93-4668-9bbb-52aa63c5d0dd/approve`

```
Error approving quote: ReferenceError: quoteEvents is not defined
    at <anonymous> (/home/runner/workspace/apps/app/server/routes.ts:3886:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)

Response: 500 Internal Server Error
```

**Impact:** Quote approval workflow completely broken - users cannot approve quotes.

---

## ⚠️ 400 BAD REQUEST ERRORS

### 2. Missing Baker ID in Multiple Endpoints
Multiple endpoints require `bakerId` but it's not being provided:

```
GET /api/quote-templates → 400 {"error":"bakerId is required"}
GET /api/customers → 400 {"error":"bakerId or tenantId is required"}  
GET /api/contract-templates → 400 {"error":"bakerId is required"}
POST /api/leads → 400 {"error":"Baker ID required"}
```

**Impact:** Users cannot access templates, customers, or create leads.

### 3. Baker Not Found Error
```
GET /api/bakers/leads → 404 {"message":"Baker not found"}
```

**Impact:** Cannot retrieve leads associated with baker.

---

## 🚫 403 FORBIDDEN ERRORS

### 4. Event Timeline Permission Issues
Users cannot access event timelines for their own quotes, contracts, and invoices:

```
GET /api/quotes/93f48c8e-5be3-4f85-84c4-2a607289cf2c/events → 403 {"error":"Forbidden: Not your quote"}
GET /api/quotes/ece1ae14-d49c-4ff2-b45b-c3063d1f1d92/events → 403 {"error":"Forbidden: Not your quote"}
GET /api/contracts/8c6adc8a-57bc-48aa-bbd8-7321f68282ea/events → 403 {"error":"Forbidden: Not your contract"}
GET /api/contracts/d302979d-98b8-4945-b15d-45d66ea62aef/events → 403
GET /api/invoices/60fa273c-2288-4d4d-a639-c8901a7f4b18 → 403 {"error":"..."}
GET /api/invoices/6b414d27-7375-4fae-847b-c093bb10ea33 → 403 {"error":"..."}
```

**Impact:** Timeline/audit functionality completely inaccessible due to permission checks failing.

### 5. Feature Flags Disabled (Expected Behavior)
```
GET /api/booking/list → 403 {"error":"Booking feature is disabled"}
GET /api/booking/settings → 403 {"error":"Booking feature is disabled"}
GET /api/auto-reply/settings → 403 {"error":"Auto-reply feature is disabled"}
GET /api/auto-reply/templates → 403 {"error":"Auto-reply feature is disabled"}
GET /api/auto-reply/rules → 403 {"error":"Auto-reply feature is disabled"}
```

**Note:** These appear to be intentionally disabled via feature flags.

---

## ❌ 404 NOT FOUND ERRORS

### 6. Venue Not Found When Creating Contracts
```
POST /api/contracts → 404 {
  "error":"Venue not found",
  "message":"This suggests one of two issues: (1) tenantId is missing or (2) quote.venueId doesn't match a real venue in your venues table"
}
```

**Attempted twice at:** 5:46:31 PM and 5:46:34 PM  
**Impact:** Cannot create contracts from quotes - workflow broken.

---

## ⚠️ WARNINGS (Non-Critical)

### 7. Sendy Integration Issues
```
⚠️  No Sendy list ID configured for lead 89583937-3fd6-40c9-b207-48aa60bc6a48 (tenant: null), skipping
⚠️  No Sendy list ID configured for lead 26c5175e-7c22-4e5c-9e99-90e25c3a69b5 (tenant: null), skipping
⚠️  No Sendy list ID configured for lead ec40ade9-885a-4396-98b9-2d0358e0fc0e (tenant: null), skipping
📧 Sendy sync complete: 0 synced, 0 failed, 3 skipped
```

**Pattern:** Leads have `tenant: null` - missing tenant association  
**Impact:** Email marketing integration not working for orphaned leads.

---

## 📊 ERROR SUMMARY

| Error Type | Count | Critical? |
|------------|-------|-----------|
| 500 Server Error (Quote Approval) | 1 | ✅ YES |
| 400 Bad Request (Missing bakerId) | 5+ | ✅ YES |
| 403 Forbidden (Event Timelines) | 6+ | ✅ YES |
| 403 Forbidden (Feature Flags) | 5 | ❌ Expected |
| 404 Not Found (Venue) | 2 | ✅ YES |
| Warnings (Sendy/Tenant) | 3 | ❌ No |

---

## 🔍 ROOT CAUSE ANALYSIS

### Primary Issues Identified:

1. **Multi-Tenancy Problems**
   - User session has `tenantId` but it's not being properly passed to API requests
   - Tenant info shows: `"tenant":null,"config":null`
   - Multiple leads have `tenant: null` instead of proper tenant association

2. **Baker ID Missing**
   - Frontend not passing `bakerId` parameter to API calls
   - Endpoints expect `bakerId` but receiving `tenantId` instead

3. **Quote Approval Code Error**
   - Variable `quoteEvents` is referenced but never defined (typo or missing import at line 3886)

4. **Permission System Misconfigured**
   - Event timeline endpoints rejecting legitimate owner access
   - Permission checks failing even for user's own resources

---

## 🛠️ RECOMMENDED FIXES

1. **CRITICAL:** Fix line 3886 in routes.ts - define `quoteEvents` variable before use
2. **CRITICAL:** Review tenant association logic - ensure tenantId is properly set
3. **HIGH:** Update API calls to include `bakerId` parameter where required
4. **HIGH:** Fix event timeline permission checks to allow owner access
5. **MEDIUM:** Investigate venue creation/association for contract workflow
6. **LOW:** Associate orphaned leads with proper tenants for Sendy sync

---

## 📝 TEST USER INFO
```
User ID: user-demo-1
Email: demo@bakeriq.app
Role: baker
Tenant ID: Should be "tenant-demo-1" but showing as null
```
