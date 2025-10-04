-- ============================================================================
-- DELETION SCRIPT: Orphan Quotes Cleanup
-- ============================================================================
-- Purpose: Remove 2 test quotes with NULL lead_id to prepare for NOT NULL constraint
-- Generated: 2025-10-04
-- Risk Level: LOW (test data only, no dependencies)
-- ============================================================================

BEGIN;

-- PREVIEW: Show rows that will be deleted
SELECT 
  id,
  quote_number,
  baker_id,
  customer_id,
  lead_id,
  created_at,
  status,
  total_amount,
  (SELECT COUNT(*) FROM quote_items WHERE quote_id = quotes.id) as items_count,
  (SELECT COUNT(*) FROM contracts WHERE quote_id = quotes.id) as contracts_count
FROM quotes
WHERE id IN (
  'test-quote--MLdk9',
  'test-quote-xu_1sY'
);

-- Expected Output:
-- id                  | quote_number | baker_id        | customer_id | lead_id | created_at          | status | total_amount | items_count | contracts_count
-- --------------------+--------------+-----------------+-------------+---------+---------------------+--------+--------------+-------------+----------------
-- test-quote--MLdk9   | Q-zgmP       | test-baker-123  | NULL        | NULL    | 2025-10-02 17:14:14 | ...    | ...          | 0           | 0
-- test-quote-xu_1sY   | Q-cHhW       | test-baker-123  | NULL        | NULL    | 2025-10-02 17:15:51 | ...    | ...          | 0           | 0

-- DELETION: Remove the orphan quotes
DELETE FROM quotes
WHERE id IN (
  'test-quote--MLdk9',
  'test-quote-xu_1sY'
);

-- Expected: DELETE 2

-- VERIFICATION: Confirm zero orphans remain
SELECT 
  COUNT(*) as remaining_orphans,
  'Should be 0' as expected_result
FROM quotes
WHERE lead_id IS NULL;

-- Expected Output:
-- remaining_orphans | expected_result
-- ------------------+-----------------
-- 0                 | Should be 0

-- If verification passes, commit the transaction
-- If any issues, rollback with: ROLLBACK;

COMMIT;

-- ============================================================================
-- POST-DELETION VERIFICATION
-- ============================================================================

-- Verify constraint can now be applied
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'quotes' AND column_name = 'lead_id';

-- Expected: is_nullable = 'YES' (will change to 'NO' after ALTER TABLE)

-- Final orphan check
SELECT COUNT(*) FROM quotes WHERE lead_id IS NULL;
-- Expected: 0

-- ============================================================================
-- READY FOR: ALTER TABLE quotes ALTER COLUMN lead_id SET NOT NULL;
-- ============================================================================
