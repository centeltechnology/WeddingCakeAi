# NOT NULL Readiness Report
**Migration Target:** `ALTER TABLE quotes ALTER COLUMN lead_id SET NOT NULL;`  
**Generated:** 2025-10-04  
**Last Updated:** 2025-10-04 (Deletion Script Prepared)  
**Mode:** DELETION SCRIPT READY

---

## Orphan Scan Results (Current State)

### Total Orphan Count
```sql
SELECT COUNT(*) FROM quotes WHERE lead_id IS NULL;
Result: 2 orphans (UNCHANGED - deletion script prepared but not executed)
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

## Deletion Script Prepared

**File:** `delete_orphan_quotes.sql`

### Explicit Quote IDs Targeted for Deletion
- `test-quote--MLdk9`
- `test-quote-xu_1sY`

### Script Features
✅ Transaction-wrapped for safety (BEGIN...COMMIT)  
✅ SELECT preview before deletion  
✅ Explicit ID list (no wildcards or patterns)  
✅ Post-deletion verification queries  
✅ Rollback instructions included  

### Script Execution Flow
1. **BEGIN** transaction
2. **SELECT** preview of rows to be deleted
3. **DELETE** the 2 specific quotes by ID
4. **SELECT** verification (should show 0 orphans)
5. **COMMIT** if verification passes

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

### ⚠️ READY TO ENFORCE: **PENDING DELETION**

**Current Status:**
- ❌ 2 orphaned quotes still present
- ✅ Deletion script prepared and ready
- ✅ Foreign key constraint exists
- ✅ No dependent objects

**After Deletion:**
- ✅ Zero orphans expected
- ✅ Constraint can be applied immediately

---

## Execution Plan

### Phase 1: Delete Orphan Quotes ⏳ PENDING ACK: MERGE
```sql
-- Execute: delete_orphan_quotes.sql
DELETE FROM quotes
WHERE id IN (
  'test-quote--MLdk9',
  'test-quote-xu_1sY'
);
-- Expected: DELETE 2
```

### Phase 2: Verify Zero Orphans
```sql
SELECT COUNT(*) FROM quotes WHERE lead_id IS NULL;
-- Expected: 0
```

### Phase 3: Apply NOT NULL Constraint
```sql
ALTER TABLE quotes 
  ALTER COLUMN lead_id SET NOT NULL;
```

### Phase 4: Confirm Constraint Active
```sql
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
- **Rows to be deleted:** 2 test quotes
- **Performance:** Negligible (constraint check on remaining rows)
- **Downtime:** None required (online DDL operation)

### Application Impact
- ✅ Quote creation API already enforces lead_id population
- ✅ Idempotent upserts ensure all new quotes have leads
- ✅ No code changes required (constraint adds safety only)

### Rollback Plan
```sql
-- If deletion causes issues (unlikely with test data)
ROLLBACK;

-- If constraint causes issues after applying
ALTER TABLE quotes 
  ALTER COLUMN lead_id DROP NOT NULL;
```

---

## Final Recommendation

**Status:** ✅ **READY FOR EXECUTION** (pending approval)

**Risk Level:** 🟢 **LOW** 
- Only test data affected
- No production impact
- No cascading deletes
- Transaction-wrapped for safety

**Next Steps:**
1. ⏳ **Awaiting:** `ACK: MERGE` to execute deletion script
2. ⏳ **Then:** Verify zero orphans
3. ⏳ **Then:** Apply NOT NULL constraint
4. ⏳ **Finally:** Verify constraint active

---

**Current Approval Status:** Deletion script prepared, awaiting `ACK: MERGE`
