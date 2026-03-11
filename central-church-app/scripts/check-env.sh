#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# check-env.sh — Pre-launch environment variable validator
#
# Usage:
#   bash scripts/check-env.sh              # check mobile app vars
#   bash scripts/check-env.sh --edge       # check Edge Function secrets
#   bash scripts/check-env.sh --all        # check everything
#
# Run this before `eas build` or `supabase functions deploy` to catch
# missing secrets early.
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check_var() {
  local name="$1"
  local source="$2"
  local value="${!name:-}"

  if [[ -z "$value" ]]; then
    echo -e "  ${RED}✗ MISSING${NC}  $name"
    echo -e "         → $source"
    ((ERRORS++)) || true
  elif [[ "$value" == REPLACE_* ]]; then
    echo -e "  ${YELLOW}⚠ UNFILLED${NC} $name (still has placeholder value)"
    ((WARNINGS++)) || true
  else
    echo -e "  ${GREEN}✓ SET${NC}      $name"
  fi
}

# Load .env.local if it exists
ENV_FILE="$(dirname "$0")/../.env.local"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

MODE="${1:-}"

if [[ "$MODE" != "--edge" ]]; then
  echo ""
  echo "── Mobile App (EXPO_PUBLIC_*) ────────────────────────────────────────"
  check_var "EXPO_PUBLIC_SUPABASE_URL"    "Supabase Dashboard → Project Settings → API → Project URL"
  check_var "EXPO_PUBLIC_SUPABASE_ANON_KEY" "Supabase Dashboard → Project Settings → API → anon key"
  check_var "EXPO_PUBLIC_ONESIGNAL_APP_ID"  "OneSignal Dashboard → Settings → Keys & IDs → OneSignal App ID"
fi

if [[ "$MODE" == "--edge" || "$MODE" == "--all" ]]; then
  echo ""
  echo "── Edge Function Secrets (supabase secrets set) ──────────────────────"
  echo "   Note: These are set via \`supabase secrets set\`, not .env.local"
  echo "   Checking for values in shell environment..."
  check_var "ONESIGNAL_APP_ID"           "OneSignal Dashboard → Settings → Keys & IDs → OneSignal App ID"
  check_var "ONESIGNAL_REST_API_KEY"     "OneSignal Dashboard → Settings → Keys & IDs → REST API Key"
  check_var "GOOGLE_CALENDAR_IDS"        "Google Calendar → Settings → Integrate → Calendar ID"
  check_var "GOOGLE_CALENDAR_API_KEY"    "Google Cloud Console → APIs & Services → Credentials → API Key"
fi

echo ""
echo "─────────────────────────────────────────────────────────────────────────"

if [[ "$ERRORS" -gt 0 ]]; then
  echo -e "${RED}✗ $ERRORS missing variable(s) — fix before building.${NC}"
  exit 1
elif [[ "$WARNINGS" -gt 0 ]]; then
  echo -e "${YELLOW}⚠ $WARNINGS unfilled placeholder(s) — replace REPLACE_* values.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ All required environment variables are set.${NC}"
fi
