# NOT NULL Readiness Report
**Migration Target:** `ALTER TABLE quotes ALTER COLUMN lead_id SET NOT NULL;`  
**Generated:** 2025-10-04  
**Mode:** READ-ONLY VALIDATION

---

## Orphan Scan Results

### Total Orphan Count
```
SELECT COUNT(*) FROM quotes WHERE lead_id IS NULL;
Result: 2 orphans
```

### Orphan Details
| Quote ID | Quote Number | Baker ID | Customer ID | Lead ID | Created At | Items | Contracts |
|----------|--------------|----------|-------------|---------|------------|-------|-----------|
| test-quote--MLdk9 | Q-zgmP | test-baker-123 | NULL | NULL | 2025-10-02 17:14:14 | 0 | 0 |
| test-quote-xu_1sY | Q-cHhW | test-baker-123 | NULL | NULL | 2025-10-02 17:15:51 | 0 | 0 |

**Analysis:**
- Both quotes are test data artifacts
- Both have NULL `customer_id` (reason they couldn't be backfilled)
- Neither has quote items or related contracts
- Both are safe to delete without cascading issues

---

## Foreign Key Status

### Current Constraint
```sql
SELECT constraint_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'quotes' AND kcu.column_name = 'lead_id';
```

**Result:**
| Constraint Name | Column | References |
|-----------------|--------|------------|
| quotes_lead_id_fkey | lead_id | leads(id) |

✅ **Foreign key already exists and enforces referential integrity**

---

## Dependencies Check

### Views Affected
```sql
SELECT table_name FROM information_schema.views 
WHERE view_definition LIKE '%quotes%' AND view_definition LIKE '%lead_id%';
```

**Result:** No views affected (0 rows)

### Triggers on quotes Table
```sql
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'quotes';
```

**Result:** No triggers found (0 rows)

✅ **No database objects will be impacted**

---

## Readiness Assessment

### ❌ READY TO ENFORCE: **NO**

**Blockers:**
1. **2 orphaned quotes with NULL lead_id**
   - Cannot enforce NOT NULL constraint while orphans exist
   - PostgreSQL will reject: `ERROR: column "lead_id" contains null values`

### Resolution Options

#### Option 1: Delete Test Data (RECOMMENDED)
```sql
-- Safe deletion (no cascading dependencies)
DELETE FROM quotes WHERE id IN ('test-quote--MLdk9', 'test-quote-xu_1sY');
```

**Pros:** Clean, permanent solution  
**Cons:** None (test data only)

#### Option 2: Populate Missing Data
```sql
-- Would require creating dummy customer + lead first
-- NOT RECOMMENDED for test artifacts
```

#### Option 3: Skip NOT NULL Enforcement
**Pros:** No immediate action needed  
**Cons:** Leaves data model incomplete, allows future orphans

---

## Recommended Action Plan

### Step 1: Clean Test Data
```sql
DELETE FROM quotes 
WHERE lead_id IS NULL 
  AND customer_id IS NULL 
  AND id LIKE 'test-%';
```

### Step 2: Verify Zero Orphans
```sql
SELECT COUNT(*) FROM quotes WHERE lead_id IS NULL;
-- Expected: 0
```

### Step 3: Apply NOT NULL Constraint
```sql
ALTER TABLE quotes 
  ALTER COLUMN lead_id SET NOT NULL;
```

### Step 4: Verification
```sql
-- Confirm constraint active
SELECT 
  column_name, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
  AND column_name = 'lead_id';
-- Expected: is_nullable = 'NO'
```

---

## Impact Assessment

### Database Impact
- **Rows affected:** 2 test quotes will be deleted
- **Performance:** Negligible (constraint check on 2 rows)
- **Downtime:** None required (online DDL operation)

### Application Impact
- ✅ Quote creation API already enforces lead_id population
- ✅ Idempotent upserts ensure all new quotes have leads
- ✅ No code changes required (constraint adds safety only)

### Rollback Plan
```sql
-- If issues arise, remove constraint
ALTER TABLE quotes 
  ALTER COLUMN lead_id DROP NOT NULL;
```

---

## Final Recommendation

**Status:** ⚠️ **BLOCKED - Action Required**

**Next Steps:**
1. Delete 2 test quotes (safe, no dependencies)
2. Re-run orphan scan to confirm zero orphans
3. Apply NOT NULL constraint
4. Verify with `\d quotes` or information_schema query

**Risk Level:** 🟢 **LOW** (only test data affected, no production impact)

---

**Awaiting explicit approval:** `ACK: APPLY`
