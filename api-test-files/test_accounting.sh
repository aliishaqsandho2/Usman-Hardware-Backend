#!/bin/bash

# API Test Script for Usman Hardware - Accounting Module
# Tests all 55 Accounting APIs (37-91)

echo "=========================================="
echo "ACCOUNTING API TEST SCRIPT (COMPREHENSIVE)"
echo "=========================================="

# Configuration
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="password123"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
LOG_FILE="api-test-files/accounting-logs/accounting_comprehensive_$(date +%Y%m%d_%H%M%S).log"
TOKEN=""

# Helpers
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS") echo -e "${GREEN}✓ $message${NC}" ;;
        "FAILED") echo -e "${RED}✗ $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ $message${NC}" ;;
    esac
    echo "[$status] $message" >> "$LOG_FILE"
}

api_call() {
    local desc=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    local cmd="curl -s -X $method '$BASE_URL$endpoint' -H 'Content-Type: application/json'"
    if [ -n "$TOKEN" ]; then cmd="$cmd -H 'Authorization: Bearer $TOKEN'"; fi
    if [ -n "$data" ]; then cmd="$cmd -d '$data'"; fi
    
    echo "---------------------------------------------------" >> "$LOG_FILE"
    echo "TEST: $desc" >> "$LOG_FILE"
    echo "Request: $method $endpoint" >> "$LOG_FILE"
    if [ -n "$data" ]; then echo "Data: $data" >> "$LOG_FILE"; fi
    
    response=$(eval $cmd)
    
    echo "Response: $response" >> "$LOG_FILE"
    
    if echo "$response" | grep -q '"success":true'; then
        print_status "SUCCESS" "$desc"
        ((PASSED++))
        return 0
    else
        local msg=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        print_status "FAILED" "$desc - $msg"
        ((FAILED++))
        return 1
    fi
}

# Login
echo "Logging in..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    print_status "FAILED" "Login failed. Response: $LOGIN_RES"
    exit 1
else
    print_status "SUCCESS" "Login successful"
fi

# Unique ID for this run
RunID=$(date +%s)
TODAY=$(date +%Y-%m-%d)
LAST_MONTH=$(date -v-1m +%Y-%m-%d 2>/dev/null || date -d "1 month ago" +%Y-%m-%d)

echo ""
echo "--- ACCOUNTS MANAGEMENT (37-46) ---"
# 39. Create Account
ACC_CODE="ACC$RunID"
api_call "39. Create Account" "POST" "/api/accounts" "{\"account_code\":\"$ACC_CODE\",\"account_name\":\"Test Asset $RunID\",\"account_type\":\"asset\"}"
ACC_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 37. List Accounts
api_call "37. List Accounts" "GET" "/api/accounts" ""

# 38. Get Account
api_call "38. Get Account Details" "GET" "/api/accounts/$ACC_ID" ""

# 40. Update Account
api_call "40. Update Account" "PUT" "/api/accounts/$ACC_ID" "{\"account_code\":\"$ACC_CODE\",\"account_name\":\"Updated Asset $RunID\",\"account_type\":\"asset\"}"

# 42. Get by Type
api_call "42. Get Accounts by Type" "GET" "/api/accounts/type/asset" ""

# 43. Get by Code
api_call "43. Get Account by Code" "GET" "/api/accounts/code/$ACC_CODE" ""

# 44. Toggle Status
api_call "44. Toggle Account Status" "PATCH" "/api/accounts/$ACC_ID/status" ""
api_call "44b. Toggle Status Back" "PATCH" "/api/accounts/$ACC_ID/status" ""

# 45. Get Balance
api_call "45. Get Account Balance" "GET" "/api/accounts/balance/$ACC_ID" ""

# 46. Get Summary
api_call "46. Get Accounts Summary" "GET" "/api/accounts/summary" ""

# 41. Delete Account (Create a temp one to delete)
TEMP_ACC="DEL$RunID"
api_call "Create Temp Account for Deletion" "POST" "/api/accounts" "{\"account_code\":\"$TEMP_ACC\",\"account_name\":\"To Delete\",\"account_type\":\"expense\"}"
DEL_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
api_call "41. Delete Account" "DELETE" "/api/accounts/$DEL_ID" ""


echo ""
echo "--- TRANSACTIONS (47-57) ---"
# Create Expense Account for Double Entry
EXP_CODE="EXP$RunID"
api_call "Create Expense Account" "POST" "/api/accounts" "{\"account_code\":\"$EXP_CODE\",\"account_name\":\"Expense Test $RunID\",\"account_type\":\"expense\"}"
EXP_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 49. Create Transaction
TXN_DATA="{\"transaction_date\":\"$TODAY\",\"description\":\"Test Txn\",\"reference_type\":\"expense\",\"entries\":[{\"account_id\":$EXP_ID,\"entry_type\":\"debit\",\"amount\":100},{\"account_id\":$ACC_ID,\"entry_type\":\"credit\",\"amount\":100}]}"
api_call "49. Create Transaction" "POST" "/api/transactions" "$TXN_DATA"
TXN_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 47. List api
api_call "47. List Transactions" "GET" "/api/transactions" ""

# 48. Get Details
api_call "48. Get Transaction Details" "GET" "/api/transactions/$TXN_ID" ""

# 50. Update Transaction
api_call "50. Update Transaction" "PUT" "/api/transactions/$TXN_ID" "{\"description\":\"Updated Txn\",\"transaction_date\":\"$TODAY\"}"

# 52. By Date
api_call "52. Get Transactions by Date" "GET" "/api/transactions/date/$TODAY" ""

# 53. By Range
api_call "53. Get Transactions by Range" "GET" "/api/transactions/range/$LAST_MONTH/$TODAY" ""

# 54. By Type
api_call "54. Get Transactions by Type" "GET" "/api/transactions/type/expense" ""

# 55. By Reference (Skipping dependent ID logic, try generic search or specific ID if ref stored)
# Note: implementation of getByReference takes type/id. 
# We don't have a linked ref record easily. We can skip or try dummy. 
# Let's try 0.
api_call "55. Get Transaction by Reference (Mock)" "GET" "/api/transactions/reference/expense/0" ""

# 56. Reverse
api_call "56. Reverse Transaction" "POST" "/api/transactions/$TXN_ID/reverse" ""

# 57. Export
api_call "57. Export Transactions" "GET" "/api/transactions/export" ""

# 51. Delete (Soft)
api_call "51. Delete Transaction" "DELETE" "/api/transactions/$TXN_ID" ""


echo ""
echo "--- TRANSACTION ENTRIES (58-62) ---"
# 58. List
api_call "58. List Entries" "GET" "/api/transaction-entries" ""

# 59. By Transaction
api_call "59. Get Entries by Transaction" "GET" "/api/transaction-entries/transaction/$TXN_ID" ""

# 60. By Account
api_call "60. Get Entries by Account" "GET" "/api/transaction-entries/account/$ACC_ID" ""

# 61. Create Entry (Manual)
api_call "61. Create Entry (Manual)" "POST" "/api/transaction-entries" "{\"transaction_id\":$TXN_ID,\"account_id\":$ACC_ID,\"entry_type\":\"debit\",\"amount\":10,\"description\":\"Manual Entry\"}"
ENTRY_ID=$(echo "$response" | grep -o '"insertId":[0-9]*' | head -1 | cut -d':' -f2 | tr -d '}')
if [ -z "$ENTRY_ID" ]; then ENTRY_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2); fi
# Note: insertId might not be returned if not standard success/data format? 
# Checking controller: success(res, null, 'Entry created'); -> No ID returned. 
# So 62 Delete might fail if we don't fetch list first.

# Fetch latest entry to delete
api_call "Get Entry for Deletion" "GET" "/api/transaction-entries?limit=1" ""
DEL_ENTRY_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 62. Delete Entry
if [ -n "$DEL_ENTRY_ID" ]; then
    api_call "62. Delete Entry" "DELETE" "/api/transaction-entries/$DEL_ENTRY_ID" ""
fi


echo ""
echo "--- CASH FLOW (63-72) ---"
# 65. Record
CF_DATA="{\"type\":\"outflow\",\"account_id\":$ACC_ID,\"amount\":50,\"date\":\"$TODAY\",\"description\":\"Test flow\"}"
api_call "65. Record Cash Flow" "POST" "/api/cash-flow" "$CF_DATA"
CF_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 63. List
api_call "63. List Cash Flow" "GET" "/api/cash-flow" ""

# 64. Get Details
api_call "64. Get Cash Flow Details" "GET" "/api/cash-flow/$CF_ID" ""

# 66. Update
api_call "66. Update Cash Flow" "PUT" "/api/cash-flow/$CF_ID" "{\"type\":\"outflow\",\"amount\":60,\"date\":\"$TODAY\",\"description\":\"Updated Flow\"}"

# 68. By Type
api_call "68. Get Cash Flow by Type" "GET" "/api/cash-flow/type/outflow" ""

# 69. By Date
api_call "69. Get Cash Flow by Date" "GET" "/api/cash-flow/date/$TODAY" ""

# 70. By Range
api_call "70. Get Cash Flow by Range" "GET" "/api/cash-flow/range/$LAST_MONTH/$TODAY" ""

# 71. By Account
api_call "71. Get Cash Flow by Account" "GET" "/api/cash-flow/account/$ACC_ID" ""

# 72. Summary
api_call "72. Get Cash Flow Summary" "GET" "/api/cash-flow/summary" ""

# 67. Delete
api_call "67. Delete Cash Flow" "DELETE" "/api/cash-flow/$CF_ID" ""


echo ""
echo "--- BUDGETS (73-82) ---"
# 75. Create
RAND_MONTH=$((1 + RANDOM % 12))
BUD_DATA="{\"year\":2025,\"month\":$RAND_MONTH,\"category\":\"Office $RunID\",\"budget_amount\":1000}"
api_call "75. Create Budget" "POST" "/api/budgets" "$BUD_DATA"
BUD_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 73. List
api_call "73. List Budgets" "GET" "/api/budgets" ""

# 74. Details
api_call "74. Get Budget Details" "GET" "/api/budgets/$BUD_ID" ""

# 76. Update
api_call "76. Update Budget" "PUT" "/api/budgets/$BUD_ID" "{\"budget_amount\":1200}"

# 78. By Year
api_call "78. Get Budgets by Year" "GET" "/api/budgets/year/2025" ""

# 79. By Month
api_call "79. Get Budgets by Month" "GET" "/api/budgets/month/2025/$RAND_MONTH" ""

# 80. By Category
api_call "80. Get Budgets by Category" "GET" "/api/budgets/category/Office%20$RunID" ""

# 81. Update Actual
api_call "81. Update Actual Amount" "PATCH" "/api/budgets/$BUD_ID/amount" "{\"amount\":500}"

# 82. Variance
api_call "82. Get Variance Report" "GET" "/api/budgets/variance-report" ""

# 77. Delete
api_call "77. Delete Budget" "DELETE" "/api/budgets/$BUD_ID" ""


echo ""
echo "--- PROFIT SUMMARY (83-91) ---"
# Cleanup existing for today (avoid dupes from previous runs)
PREV_ID=$(curl -s -X GET "$BASE_URL/api/profit-summary/period/$TODAY" -H "Authorization: Bearer $TOKEN" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
if [ -n "$PREV_ID" ]; then
    curl -s -X DELETE "$BASE_URL/api/profit-summary/$PREV_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
fi

# 85. Create
PROF_DATA="{\"period_date\":\"$TODAY\",\"period_type\":\"monthly\",\"revenue\":5000,\"cogs\":2000,\"expenses\":1000}"
api_call "85. Create Profit Summary" "POST" "/api/profit-summary" "$PROF_DATA"
PROF_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 83. List
api_call "83. List Profit Summaries" "GET" "/api/profit-summary" ""

# 84. Details
api_call "84. Get Profit Summary Details" "GET" "/api/profit-summary/$PROF_ID" ""

# 86. Update
api_call "86. Update Profit Summary" "PUT" "/api/profit-summary/$PROF_ID" "{\"revenue\":6000,\"cogs\":2000,\"expenses\":1000}"

# 88. By Period Date
api_call "88. Get by Period Date" "GET" "/api/profit-summary/period/$TODAY" ""

# 89. By Type
api_call "89. Get by Type" "GET" "/api/profit-summary/type/monthly" ""

# 90. By Range
api_call "90. Get by Range" "GET" "/api/profit-summary/range/$LAST_MONTH/$TODAY" ""

# 91. Report
api_call "91. Generate Profit Report" "GET" "/api/profit-summary/report" ""

# 87. Delete
api_call "87. Delete Profit Summary" "DELETE" "/api/profit-summary/$PROF_ID" ""


echo ""
echo "=========================================="
echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo "=========================================="
if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
