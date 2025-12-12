#!/bin/bash

# API Test Script for Usman Hardware - Expenses Module
# Tests all 57 Expenses APIs (92-148)

echo "=========================================="
echo "EXPENSES API TEST SCRIPT"
echo "=========================================="

# Configuration
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="password123"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
LOG_FILE="api-test-files/expenses_test_$(date +%Y%m%d_%H%M%S).log"
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
    echo "Request: $method $endpoint $data" >> "$LOG_FILE"
    
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
USER_ID=$(echo "$LOGIN_RES" | grep -o '"id":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')

if [ -z "$TOKEN" ]; then
    print_status "FAILED" "Login failed. Aborting."
    exit 1
else
    print_status "SUCCESS" "Login successful"
fi

RunID=$(date +%s)
TODAY=$(date +%Y-%m-%d)
NEXT_WEEK=$(date -v+7d +%Y-%m-%d 2>/dev/null || date -d "7 days" +%Y-%m-%d)

echo ""
echo "--- EXPENSES (92-103) ---"
# 94. Create
EXP_DATA="{\"category\":\"Office\",\"amount\":150,\"date\":\"$TODAY\",\"payment_method\":\"cash\",\"description\":\"Paper Ream\",\"reference\":\"REF$RunID\",\"created_by\":$USER_ID}"
api_call "94. Create Expense" "POST" "/api/expenses" "$EXP_DATA"
EXP_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 92. List
api_call "92. List Expenses" "GET" "/api/expenses" ""

# 93. Details
api_call "93. Get Expense Details" "GET" "/api/expenses/$EXP_ID" ""

# 95. Update
api_call "95. Update Expense" "PUT" "/api/expenses/$EXP_ID" "{\"category\":\"Office\",\"amount\":160,\"date\":\"$TODAY\",\"payment_method\":\"cash\"}"

# 97. By Category
api_call "97. Get by Category" "GET" "/api/expenses/category/Office" ""

# 98. By Date
api_call "98. Get by Date" "GET" "/api/expenses/date/$TODAY" ""

# 99. By Range
api_call "99. Get by Range" "GET" "/api/expenses/range/$TODAY/$TODAY" ""

# 100. By Method
api_call "100. Get by Method" "GET" "/api/expenses/method/cash" ""

# 101. By User
api_call "101. Get by User" "GET" "/api/expenses/user/$USER_ID" ""

# 102. Upload Receipt (Stub)
api_call "102. Upload Receipt" "POST" "/api/expenses/$EXP_ID/receipt" ""

# 103. Summary
api_call "103. Get Summary" "GET" "/api/expenses/summary" ""

# 96. Delete
api_call "96. Delete Expense" "DELETE" "/api/expenses/$EXP_ID" ""


echo ""
echo "--- SCHEDULED EXPENSES (104-113) ---"
# 106. Create
SCH_DATA="{\"category\":\"Rent\",\"amount\":2000,\"frequency\":\"monthly\",\"start_date\":\"$TODAY\",\"payment_method\":\"bank_transfer\",\"created_by\":$USER_ID}"
api_call "106. Create Scheduled Expense" "POST" "/api/scheduled-expenses" "$SCH_DATA"
SCH_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 104. List
api_call "104. List Scheduled" "GET" "/api/scheduled-expenses" ""

# 105. Details
api_call "105. Get Scheduled Details" "GET" "/api/scheduled-expenses/$SCH_ID" ""

# 107. Update
api_call "107. Update Scheduled" "PUT" "/api/scheduled-expenses/$SCH_ID" "{\"category\":\"Rent Updated\",\"amount\":2100,\"frequency\":\"monthly\",\"start_date\":\"$TODAY\",\"payment_method\":\"bank_transfer\"}"

# 109. Update Status
api_call "109. Update Status" "PATCH" "/api/scheduled-expenses/$SCH_ID/status" "{\"status\":\"active\"}"

# 110. By Status
api_call "110. Get by Status" "GET" "/api/scheduled-expenses/status/active" ""

# 111. By Frequency
api_call "111. Get by Frequency" "GET" "/api/scheduled-expenses/frequency/monthly" ""

# 113. Upcoming
api_call "113. Get Upcoming" "GET" "/api/scheduled-expenses/upcoming" ""

# 112. Execute
api_call "112. Execute Scheduled" "POST" "/api/scheduled-expenses/$SCH_ID/execute" ""

# 108. Delete
api_call "108. Delete Scheduled" "DELETE" "/api/scheduled-expenses/$SCH_ID" ""


echo ""
echo "--- CUSTOMER PAYMENTS (114-127) ---"
# 116. Create
PAY_DATA="{\"amount\":500,\"payment_method\":\"cheque\",\"date\":\"$TODAY\",\"payment_type\":\"receipt\",\"status\":\"cleared\",\"reference\":\"PAY$RunID\"}"
api_call "116. Create Payment" "POST" "/api/payments" "$PAY_DATA"
PAY_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 114. List
api_call "114. List Payments" "GET" "/api/payments" ""

# 115. Details
api_call "115. Get Payment Details" "GET" "/api/payments/$PAY_ID" ""

# 117. Update
api_call "117. Update Payment" "PUT" "/api/payments/$PAY_ID" "{\"amount\":550,\"payment_method\":\"cheque\",\"date\":\"$TODAY\",\"status\":\"cleared\",\"reference\":\"PAY$RunID-UPD\"}"

# 120. By Date
api_call "120. Get by Date" "GET" "/api/payments/date/$TODAY" ""

# 121. By Type
api_call "121. Get by Type" "GET" "/api/payments/type/receipt" ""

# 122. By Method
api_call "122. Get by Method" "GET" "/api/payments/method/cheque" ""

# 123. By Status
api_call "123. Get by Status" "GET" "/api/payments/status/cleared" ""

# 124. Update Status
api_call "124. Update Status" "PATCH" "/api/payments/$PAY_ID/status" "{\"status\":\"pending\"}"

# 125. By Reference
# Note: Needs exact match including update
api_call "125. Get by Reference" "GET" "/api/payments/reference/PAY$RunID-UPD" ""

# 126. Allocate (Convenience)
# Need fake invoice ID, let's just pass 1
api_call "126. Allocate Payment" "POST" "/api/payments/$PAY_ID/allocate" "{\"invoice_id\":1,\"amount\":100}"

# 127. Unallocated
api_call "127. Get Unallocated" "GET" "/api/payments/unallocated" ""

# 118. Delete
api_call "118. Delete Payment" "DELETE" "/api/payments/$PAY_ID" ""


echo ""
echo "--- SUPPLIER PAYMENTS (128-135) ---"
# 130. Create
SUP_PAY_DATA="{\"amount\":1000,\"payment_method\":\"bank_transfer\",\"date\":\"$TODAY\",\"status\":\"pending\"}"
api_call "130. Create Supplier Payment" "POST" "/api/supplier-payments" "$SUP_PAY_DATA"
SP_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 128. List
api_call "128. List Supplier Payments" "GET" "/api/supplier-payments" ""

# 129. Details
api_call "129. Get Details" "GET" "/api/supplier-payments/$SP_ID" ""

# 131. Update
api_call "131. Update Supplier Payment" "PUT" "/api/supplier-payments/$SP_ID" "{\"amount\":1100,\"payment_method\":\"bank_transfer\",\"date\":\"$TODAY\",\"status\":\"pending\"}"

# 134. Update Status
api_call "134. Update Status" "PATCH" "/api/supplier-payments/$SP_ID/status" "{\"status\":\"cleared\"}"

# 135. Outstanding
api_call "135. Get Outstanding" "GET" "/api/supplier-payments/outstanding" ""

# 132. Delete
api_call "132. Delete Supplier Payment" "DELETE" "/api/supplier-payments/$SP_ID" ""


echo ""
echo "--- PAYMENT ALLOCATIONS (136-143) ---"
# 138. Create
# Create a dummy payment to allocate
api_call "Create Dummy Payment for Allocation" "POST" "/api/payments" "{\"amount\":500,\"payment_method\":\"cash\",\"date\":\"$TODAY\",\"payment_type\":\"receipt\"}"
DUMMY_PAY_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

ALLOC_DATA="{\"payment_id\":$DUMMY_PAY_ID,\"invoice_id\":1,\"invoice_type\":\"sale\",\"allocated_amount\":100}"
api_call "138. Create Allocation" "POST" "/api/payment-allocations" "$ALLOC_DATA"
ALLOC_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 136. List
api_call "136. List Allocations" "GET" "/api/payment-allocations" ""

# 137. Details
api_call "137. Get Allocation Details" "GET" "/api/payment-allocations/$ALLOC_ID" ""

# 139. Update
api_call "139. Update Allocation" "PUT" "/api/payment-allocations/$ALLOC_ID" "{\"allocated_amount\":150,\"allocation_date\":\"$TODAY\"}"

# 141. By Payment
api_call "141. Get by Payment" "GET" "/api/payment-allocations/payment/$DUMMY_PAY_ID" ""

# 142. By Invoice
api_call "142. Get by Invoice" "GET" "/api/payment-allocations/invoice/1" ""

# 143. By Invoice Type
api_call "143. Get by Invoice Type" "GET" "/api/payment-allocations/invoice-type/sale/1" ""

# 140. Delete
api_call "140. Delete Allocation" "DELETE" "/api/payment-allocations/$ALLOC_ID" ""


echo ""
echo "--- PAYMENT TERMS (144-148) ---"
# 146. Create
TERM_DATA="{\"name\":\"Net 45\",\"days\":45,\"description\":\"Payment within 45 days\"}"
api_call "146. Create Payment Term" "POST" "/api/payment-terms" "$TERM_DATA"
TERM_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 144. List
api_call "144. List Terms" "GET" "/api/payment-terms" ""

# 145. Details
api_call "145. Get Term Details" "GET" "/api/payment-terms/$TERM_ID" ""

# 147. Update
api_call "147. Update Term" "PUT" "/api/payment-terms/$TERM_ID" "{\"name\":\"Net 60\",\"days\":60,\"description\":\"Payment within 60 days\"}"

# 148. Delete
api_call "148. Delete Term" "DELETE" "/api/payment-terms/$TERM_ID" ""


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
