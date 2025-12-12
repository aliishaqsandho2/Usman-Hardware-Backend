#!/bin/bash

# API Test Script for Usman Hardware - Procurement Module
# Tests Procurement APIs (277-292)

echo "=========================================="
echo "PROCUREMENT API TEST SCRIPT (COMPREHENSIVE)"
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
# Ensure logs directory exists
mkdir -p api-test-files/procurement-logs
LOG_FILE="api-test-files/procurement-logs/procurement_test_$(date +%Y%m%d_%H%M%S).log"
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

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    print_status "FAILED" "Authentication failed. Cannot proceed."
    exit 1
else
    print_status "SUCCESS" "Authentication successful"
fi

RunID=$(date +%s)

echo ""
echo "--- PURCHASE ORDERS (277-287) ---"
# For foreign keys, let's assume supplier_id=1 and product_id=1 (or reuse from previous tests if we persisted IDs, but simpler to rely on looseness or pre-existing data. We created supplier 1 in previous tests if not deleted. If deleted, we might need to create one.)
# Safe bet: Create a supplier first.
echo "Creating Test Supplier..."
SUP_RES=$(curl -s -X POST "$BASE_URL/api/suppliers" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"name\":\"Procurement Sup $RunID\"}")
SUP_ID=$(echo "$SUP_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 279. Create PO
PO_NUM="PO-$RunID"
api_call "279. Create Purchase Order" "POST" "/api/purchase-orders" "{\"order_number\":\"$PO_NUM\",\"supplier_id\":$SUP_ID,\"date\":\"2025-12-01\",\"expected_delivery\":\"2025-12-10\",\"subtotal\":100,\"tax\":10,\"total\":110,\"status\":\"draft\"}"
PO_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 277. List POs
api_call "277. List Purchase Orders" "GET" "/api/purchase-orders" ""

# 278. Get PO Details
api_call "278. Get PO Details" "GET" "/api/purchase-orders/$PO_ID" ""

# 280. Update PO
api_call "280. Update Purchase Order" "PUT" "/api/purchase-orders/$PO_ID" "{\"order_number\":\"$PO_NUM\",\"supplier_id\":$SUP_ID,\"date\":\"2025-12-01\",\"subtotal\":120,\"tax\":12,\"total\":132,\"status\":\"confirmed\",\"expected_delivery\":\"2025-12-20\"}"

# 282. Get by Supplier
api_call "282. Get by Supplier" "GET" "/api/purchase-orders/supplier/$SUP_ID" ""

# 283. Get by Status
api_call "283. Get by Status" "GET" "/api/purchase-orders/status/confirmed" ""

# 285. Get by Order Number
api_call "285. Get by Order Number" "GET" "/api/purchase-orders/order/$PO_NUM" ""

# 286. Get Pending Delivery
api_call "286. Get Pending Deliveries" "GET" "/api/purchase-orders/pending-delivery" ""

# 284. Update Status
api_call "284. Update Status" "PATCH" "/api/purchase-orders/$PO_ID/status" "{\"status\":\"sent\"}"

echo ""
echo "--- PO ITEMS (288-292) ---"
# Create Category and Unit for Product
echo "Creating Test Category..."
CAT_RES=$(curl -s -X POST "$BASE_URL/api/categories" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"name\":\"Procurement Cat $RunID\"}")
CAT_ID=$(echo "$CAT_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo "Creating Test Unit..."
UNIT_RES=$(curl -s -X POST "$BASE_URL/api/units" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"name\":\"Procurement Unit $RunID\",\"label\":\"pc\"}")
UNIT_NAME="Procurement Unit $RunID"

# Create Product
echo "Creating Test Product..."
PROD_RES=$(curl -s -X POST "$BASE_URL/api/products" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"name\":\"PO Item $RunID\",\"sku\":\"SKU-PO-$RunID\",\"category_id\":$CAT_ID,\"unit\":\"$UNIT_NAME\",\"price\":50,\"cost_price\":20,\"stock\":0}")
PROD_ID=$(echo "$PROD_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 289. Add Item
api_call "289. Add Item to PO" "POST" "/api/purchase-orders/$PO_ID/items" "{\"product_id\":$PROD_ID,\"quantity\":10,\"unit_price\":20,\"total\":200}"
ITEM_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 288. Get Items
api_call "288. Get PO Items" "GET" "/api/purchase-orders/$PO_ID/items" ""

# 290. Update Item
api_call "290. Update PO Item" "PUT" "/api/purchase-orders/items/$ITEM_ID" "{\"product_id\":$PROD_ID,\"quantity\":12,\"unit_price\":20,\"total\":240}"

# 292. Receive Item
api_call "292. Receive Item" "PATCH" "/api/purchase-orders/items/$ITEM_ID/receive" "{\"quantity_received\":5,\"item_condition\":\"good\"}"

# 287. Receive PO (Full)
api_call "287. Receive PO (Full)" "POST" "/api/purchase-orders/$PO_ID/receive" ""

# 291. Remove Item
api_call "291. Remove PO Item" "DELETE" "/api/purchase-orders/items/$ITEM_ID" ""


echo ""
echo "--- CLEANUP ---"
# 281. Delete PO
api_call "281. Delete PO" "DELETE" "/api/purchase-orders/$PO_ID" ""

# Cleanup Supplier/Product
curl -s -X DELETE "$BASE_URL/api/suppliers/$SUP_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
curl -s -X DELETE "$BASE_URL/api/products/$PROD_ID" -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "=========================================="
echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo "Log file: $LOG_FILE"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
