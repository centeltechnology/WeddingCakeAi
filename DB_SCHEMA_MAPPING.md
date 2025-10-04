# Database Schema Mapping Table

## Core Business Tables

### LEADS TABLE
**Table Name:** `leads`

| Canonical Name | Actual Column | Data Type | Nullable | Foreign Key |
|----------------|---------------|-----------|----------|-------------|
| Lead.id | id | varchar | NO | - |
| Lead.baker_id | baker_id | varchar | YES | → bakers.id |
| Lead.profile_id | profile_id | varchar | YES | → profiles.id |
| Lead.customer_name | customer_name | text | NO | - |
| Lead.customer_email | customer_email | text | NO | - |
| Lead.customer_phone | customer_phone | text | YES | - |
| Lead.wedding_date | wedding_date | text | YES | - |
| Lead.guest_count | guest_count | integer | YES | - |
| Lead.budget | budget | text | YES | - |
| Lead.message | message | text | YES | - |
| Lead.status | status | text | YES | - |
| Lead.estimate_id | estimate_id | varchar | YES | → estimates.id |
| Lead.created_at | created_at | timestamp | YES | - |
| Lead.tenant_id | tenant_id | varchar | YES | → tenants.id |

**Note:** The `leads` table does NOT have a `customer_id` column. It has `profile_id` instead.

---

### CUSTOMERS TABLE
**Table Name:** `customers`

| Canonical Name | Actual Column | Data Type | Nullable | Foreign Key |
|----------------|---------------|-----------|----------|-------------|
| Customer.id | id | varchar | NO | - |
| Customer.tenant_id | tenant_id | varchar | YES | → tenants.id |
| Customer.baker_id | baker_id | varchar | YES | → bakers.id |
| Customer.name | name | text | NO | - |
| Customer.email | email | text | NO | - |
| Customer.phone | phone | text | YES | - |
| Customer.address | address | text | YES | - |
| Customer.partner_name | partner_name | text | YES | - |
| Customer.event_date | event_date | date | YES | - |
| Customer.event_type | event_type | text | YES | - |
| Customer.venue | venue | text | YES | - |
| Customer.venue_address | venue_address | text | YES | - |
| Customer.guest_count | guest_count | integer | YES | - |
| Customer.budget | budget | text | YES | - |
| Customer.source | source | text | YES | - |
| Customer.status | status | text | YES | - |
| Customer.dietary_restrictions | dietary_restrictions | json | YES | - |
| Customer.preferences | preferences | json | YES | - |
| Customer.priority | priority | text | YES | - |
| Customer.tags | tags | ARRAY | YES | - |
| Customer.last_contact_date | last_contact_date | timestamp | YES | - |
| Customer.next_follow_up_date | next_follow_up_date | date | YES | - |
| Customer.stripe_customer_id | stripe_customer_id | varchar | YES | - |
| Customer.has_portal_access | has_portal_access | boolean | YES | - |
| Customer.portal_password | portal_password | text | YES | - |
| Customer.portal_last_login | portal_last_login | timestamp | YES | - |
| Customer.portal_activation_token | portal_activation_token | varchar | YES | - |
| Customer.portal_activated_at | portal_activated_at | timestamp | YES | - |
| Customer.created_at | created_at | timestamp | YES | - |
| Customer.updated_at | updated_at | timestamp | YES | - |

---

### QUOTES TABLE
**Table Name:** `quotes`

| Canonical Name | Actual Column | Data Type | Nullable | Foreign Key |
|----------------|---------------|-----------|----------|-------------|
| Quote.id | id | varchar | NO | - |
| Quote.tenant_id | tenant_id | varchar | YES | → tenants.id |
| Quote.baker_id | baker_id | varchar | YES | → bakers.id |
| Quote.customer_id | customer_id | varchar | YES | → customers.id |
| Quote.template_id | template_id | varchar | YES | → quote_templates.id |
| Quote.quote_number | quote_number | text | NO | - |
| Quote.title | title | text | NO | - |
| Quote.description | description | text | YES | - |
| Quote.event_date | event_date | date | YES | - |
| Quote.event_type | event_type | text | YES | - |
| Quote.guest_count | guest_count | integer | YES | - |
| Quote.delivery_address | delivery_address | text | YES | - |
| Quote.setup_time | setup_time | text | YES | - |
| Quote.subtotal | subtotal | numeric | YES | - |
| Quote.tax_rate | tax_rate | numeric | YES | - |
| Quote.tax_amount | tax_amount | numeric | YES | - |
| Quote.total | total | numeric | YES | - |
| Quote.deposit_amount | deposit_amount | numeric | YES | - |
| Quote.deposit_percentage | deposit_percentage | numeric | YES | - |
| Quote.status | status | text | YES | - |
| Quote.valid_until | valid_until | date | YES | - |
| Quote.customer_notes | customer_notes | text | YES | - |
| Quote.internal_notes | internal_notes | text | YES | - |
| Quote.terms | terms | text | YES | - |
| Quote.approval_token | approval_token | text | YES | - |
| Quote.approval_token_expires_at | approval_token_expires_at | timestamp | YES | - |
| Quote.declined_at | declined_at | timestamp | YES | - |
| Quote.decline_reason | decline_reason | text | YES | - |
| Quote.created_at | created_at | timestamp | YES | - |
| Quote.updated_at | updated_at | timestamp | YES | - |
| Quote.sent_at | sent_at | timestamp | YES | - |
| Quote.viewed_at | viewed_at | timestamp | YES | - |
| Quote.approved_at | approved_at | timestamp | YES | - |

---

### QUOTE_ITEMS TABLE
**Table Name:** `quote_items`

| Canonical Name | Actual Column | Data Type | Nullable | Foreign Key |
|----------------|---------------|-----------|----------|-------------|
| QuoteItem.id | id | varchar | NO | - |
| QuoteItem.quote_id | quote_id | varchar | NO | → quotes.id |
| QuoteItem.name | name | text | NO | - |
| QuoteItem.description | description | text | YES | - |
| QuoteItem.quantity | quantity | numeric | YES | - |
| QuoteItem.unit_price | unit_price | numeric | YES | - |
| QuoteItem.total_price | total_price | numeric | YES | - |
| QuoteItem.category | category | text | YES | - |
| QuoteItem.sort_order | sort_order | integer | YES | - |

---

### CONTRACTS TABLE
**Table Name:** `contracts`

| Canonical Name | Actual Column | Data Type | Nullable | Foreign Key |
|----------------|---------------|-----------|----------|-------------|
| Contract.id | id | varchar | NO | - |
| Contract.tenant_id | tenant_id | varchar | YES | → tenants.id |
| Contract.baker_id | baker_id | varchar | YES | → bakers.id |
| Contract.customer_id | customer_id | varchar | YES | → customers.id |
| Contract.quote_id | quote_id | varchar | YES | → quotes.id |
| Contract.template_id | template_id | varchar | YES | → contract_templates.id |
| Contract.contract_number | contract_number | text | NO | - |
| Contract.title | title | text | NO | - |
| Contract.content | content | text | NO | - |
| Contract.total_amount | total_amount | numeric | YES | - |
| Contract.deposit_amount | deposit_amount | numeric | YES | - |
| Contract.remaining_balance | remaining_balance | numeric | YES | - |
| Contract.event_date | event_date | date | YES | - |
| Contract.delivery_date | delivery_date | date | YES | - |
| Contract.setup_time | setup_time | text | YES | - |
| Contract.delivery_address | delivery_address | text | YES | - |
| Contract.special_instructions | special_instructions | text | YES | - |
| Contract.status | status | text | YES | - |
| Contract.signed_at | signed_at | timestamp | YES | - |
| Contract.completed_at | completed_at | timestamp | YES | - |
| Contract.cancelled_at | cancelled_at | timestamp | YES | - |
| Contract.cancellation_reason | cancellation_reason | text | YES | - |
| Contract.created_at | created_at | timestamp | YES | - |
| Contract.updated_at | updated_at | timestamp | YES | - |

---

### CONTRACT_SIGNATURES TABLE
**Table Name:** `contract_signatures`

| Canonical Name | Actual Column | Data Type | Nullable | Foreign Key |
|----------------|---------------|-----------|----------|-------------|
| ContractSignature.id | id | varchar | NO | - |
| ContractSignature.contract_id | contract_id | varchar | NO | → contracts.id |
| ContractSignature.signer_name | signer_name | text | NO | - |
| ContractSignature.signer_email | signer_email | text | NO | - |
| ContractSignature.signer_type | signer_type | text | NO | - |
| ContractSignature.signature_data | signature_data | text | YES | - |
| ContractSignature.ip_address | ip_address | text | YES | - |
| ContractSignature.user_agent | user_agent | text | YES | - |
| ContractSignature.signed_at | signed_at | timestamp | YES | - |

---

## Data Flow & Relationships

### Lead → Customer Conversion Flow
1. **Lead** (in `leads` table) - Initial inquiry/contact
   - Has: `customer_name`, `customer_email`, `customer_phone`, etc.
   - Does NOT have `customer_id` field
   - Has `profile_id` → references `profiles.id` (old system, may be null)

2. **Customer** (in `customers` table) - Converted lead
   - Created from lead data during conversion
   - Has: `name`, `email`, `phone`, etc.
   - Referenced by quotes, contracts

3. **Quote** (in `quotes` table) - Pricing proposal
   - Has: `customer_id` → references `customers.id`
   - Must have valid customer before creation

4. **Contract** (in `contracts` table) - Legal agreement
   - Has: `customer_id` → references `customers.id`
   - Has: `quote_id` → references `quotes.id`
   - Can be created from approved quote

### Foreign Key Chain
```
Lead (no customer_id)
  ↓ (conversion creates)
Customer.id
  ↓ (referenced by)
Quote.customer_id → Customer.id
  ↓ (referenced by)
Contract.quote_id → Quote.id
Contract.customer_id → Customer.id
  ↓ (referenced by)
ContractSignature.contract_id → Contract.id
```

## Key Insights for Development

1. **No Direct Lead-Customer Link**: The `leads` table does NOT have a `customer_id` column. When converting a lead to a customer, you create a new customer record and the lead remains unchanged.

2. **Quote Requires Customer**: A quote MUST have a `customer_id`. You cannot create a quote without first having a customer in the `customers` table.

3. **Contract Dependencies**: A contract can reference both a `customer_id` (required) and a `quote_id` (optional, if created from quote).

4. **All Tables Use VARCHAR UUIDs**: All ID columns are `varchar` with `gen_random_uuid()` default, not serial integers.

5. **Tenant Isolation**: Most tables have `tenant_id` for multi-tenant support, but `leads` is the only one shown here with tenant_id.
