#!/bin/bash

# Guard script to prevent marketing content in admin pages
# This ensures admin pages don't contain public marketing headers, CTAs, or links

set -e

ADMIN_PAGES=(
  "apps/app/client/src/pages/Settings.tsx"
  "apps/app/client/src/pages/billing.tsx"
  "apps/app/client/src/components/AppLayout.tsx"
)

MARKETING_PATTERNS=(
  "NavigationHeader"
  "Find Bakers"
  "Baker Login"
  "Get Started"
  "href=\"/signup\""
  "href=\"/pricing\""
  "href=\"/features\""
  "href=\"/marketplace\""
)

VIOLATIONS=0

echo "🔍 Checking admin pages for marketing content..."
echo ""

for PAGE in "${ADMIN_PAGES[@]}"; do
  if [ ! -f "$PAGE" ]; then
    echo "⚠️  File not found: $PAGE"
    continue
  fi
  
  for PATTERN in "${MARKETING_PATTERNS[@]}"; do
    if grep -q "$PATTERN" "$PAGE" 2>/dev/null; then
      echo "❌ VIOLATION: Found '$PATTERN' in $PAGE"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
done

echo ""

if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ All admin pages are clean - no marketing content detected"
  exit 0
else
  echo "❌ Found $VIOLATIONS violation(s) - admin pages contain marketing content"
  echo ""
  echo "Admin pages should NOT contain:"
  echo "  - NavigationHeader component"
  echo "  - Links to /signup, /pricing, /features, /marketplace"
  echo "  - Marketing CTAs like 'Find Bakers', 'Baker Login', 'Get Started'"
  echo ""
  echo "Use PublicLayout for public pages and AppLayout for admin pages."
  exit 1
fi
