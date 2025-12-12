#!/bin/bash

# API Test Script for Usman Hardware - Parties Module
# Tests Parties Management APIs (240-276)

echo "=========================================="
echo "PARTIES API TEST SCRIPT (COMPREHENSIVE)"
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
mkdir -p api-test-files/parties-logs
LOG_FILE="api-test-files/parties-logs/parties_test_$(date +%Y%m%d_%H%M%S).log"
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
echo "--- CUSTOMERS (240-252) ---"
# 242. Create Customer
CustName="Customer $RunID"
CustEmail="cust$RunID@test.com"
api_call "242. Create Customer" "POST" "/api/customers" "{\"name\":\"$CustName\",\"email\":\"$CustEmail\",\"phone\":\"1234567890\",\"type\":\"Permanent\",\"credit_limit\":1000}"
CUST_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 240. List Customers
api_call "240. List Customers" "GET" "/api/customers" ""

# 241. Get Customer Details
api_call "241. Get Customer Details" "GET" "/api/customers/$CUST_ID" ""

# 243. Update Customer
api_call "243. Update Customer" "PUT" "/api/customers/$CUST_ID" "{\"name\":\"Updated $CustName\"}"

# 245. Get by Type
api_call "245. Get Customers by Type" "GET" "/api/customers/type/Permanent" ""

# 246. Get by Status
api_call "246. Get Customers by Status" "GET" "/api/customers/status/active" ""

# 247. Search Customers
api_call "247. Search Customers" "GET" "/api/customers/search?q=Updated" ""

# 248. Toggle Status
api_call "248. Toggle Status" "PATCH" "/api/customers/$CUST_ID/status" ""
api_call "248. Toggle Status Back" "PATCH" "/api/customers/$CUST_ID/status" ""

# 249. Update Credit Limit
api_call "249. Update Credit Limit" "PATCH" "/api/customers/$CUST_ID/credit-limit" "{\"credit_limit\":2000}"

# 250. Get Balance
api_call "250. Get Balance" "GET" "/api/customers/$CUST_ID/balance" ""

# 252. Export
api_call "252. Export Customers" "GET" "/api/customers/export" ""


echo ""
echo "--- SUPPLIERS (253-262) ---"
# 255. Create Supplier
SupName="Supplier $RunID"
SupEmail="sup$RunID@test.com"
api_call "255. Create Supplier" "POST" "/api/suppliers" "{\"name\":\"$SupName\",\"email\":\"$SupEmail\",\"phone\":\"9876543210\",\"status\":\"active\"}"
SUP_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 253. List Suppliers
api_call "253. List Suppliers" "GET" "/api/suppliers" ""

# 254. Get Supplier Details
api_call "254. Get Supplier Details" "GET" "/api/suppliers/$SUP_ID" ""

# 256. Update Supplier
api_call "256. Update Supplier" "PUT" "/api/suppliers/$SUP_ID" "{\"name\":\"Updated $SupName\"}"

# 258. Get by Status
api_call "258. Get Suppliers by Status" "GET" "/api/suppliers/status/active" ""

# 260. Search Suppliers
api_call "260. Search Suppliers" "GET" "/api/suppliers/search?q=Updated" ""

# 261. Get Outstanding
api_call "261. Get Outstanding" "GET" "/api/suppliers/$SUP_ID/outstanding" ""

# 262. Get Products (Mock)
api_call "262. Get Supplier Products" "GET" "/api/suppliers/$SUP_ID/products" ""


echo ""
echo "--- OUTSOURCING ORDERS (263-271) ---"
# Create dummy sale/product for constraints (Assuming IDs exist or we use 0 if not implementing constraint checks in tests yet, schema has NO FOREIGN KEY validation enabled usually in this setup, or we rely on logic. 
# Better to assume some IDs. Let's try 1 for Sale/Product/SaleItem since we might not have created them in this run. 
# Or we rely on auto-increment being > 0.
SALE_ID=1
PROD_ID=1
SALE_ITEM_ID=1

# 265. Create Order
api_call "265. Create Outsourcing Order" "POST" "/api/outsourcing-orders" "{\"order_number\":\"ORD-$RunID\",\"sale_id\":$SALE_ID,\"sale_item_id\":$SALE_ITEM_ID,\"product_id\":$PROD_ID,\"supplier_id\":$SUP_ID,\"quantity\":10,\"cost_per_unit\":50,\"total_cost\":500,\"status\":\"pending\"}"
ORD_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 263. List Orders
api_call "263. List Outsourcing Orders" "GET" "/api/outsourcing-orders" ""

# 264. Get Order Details
api_call "264. Get Order Details" "GET" "/api/outsourcing-orders/$ORD_ID" ""

# 266. Update Order
api_call "266. Update Order" "PUT" "/api/outsourcing-orders/$ORD_ID" "{\"status\":\"ordered\",\"notes\":\"Processed\"}"

# 268. Get by Sale
api_call "268. Get by Sale" "GET" "/api/outsourcing-orders/sale/$SALE_ID" ""

# 269. Get by Supplier
api_call "269. Get by Supplier" "GET" "/api/outsourcing-orders/supplier/$SUP_ID" ""

# 270. Get by Status
api_call "270. Get by Status" "GET" "/api/outsourcing-orders/status/ordered" ""

# 271. Update Status
api_call "271. Update Status" "PATCH" "/api/outsourcing-orders/$ORD_ID/status" "{\"status\":\"delivered\"}"


echo ""
echo "--- EXTERNAL PURCHASES (272-276) ---"
# 274. Record External Purchase
api_call "274. Record External Purchase" "POST" "/api/external-purchases" "{\"sale_id\":$SALE_ID,\"product_id\":$PROD_ID,\"quantity\":5,\"unit_price\":100,\"source\":\"Local Market\",\"reference\":\"REF-EXT-$RunID\"}"
EXT_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 272. List External Purchases
api_call "272. List External Purchases" "GET" "/api/external-purchases" ""

# 273. Get Purchase Details
api_call "273. Get Purchase Details" "GET" "/api/external-purchases/$EXT_ID" ""

# 276. Get by Sale
api_call "276. Get by Sale" "GET" "/api/external-purchases/sale/$SALE_ID" ""

# 275. Delete External Purchase
api_call "275. Delete External Purchase" "DELETE" "/api/external-purchases/$EXT_ID" ""


echo ""
echo "--- CLEANUP ---"
# 244. Delete Customer
api_call "244. Delete Customer" "DELETE" "/api/customers/$CUST_ID" ""

# 257. Delete Supplier
api_call "257. Delete Supplier" "DELETE" "/api/suppliers/$SUP_ID" ""

# 267. Delete Order
api_call "267. Delete Outsourcing Order" "DELETE" "/api/outsourcing-orders/$ORD_ID" ""


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
