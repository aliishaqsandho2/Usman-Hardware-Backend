#!/bin/bash

# API Test Script for Usman Hardware - Inventory Module
# Tests Inventory Management APIs (149-195)

echo "=========================================="
echo "INVENTORY API TEST SCRIPT (COMPREHENSIVE)"
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
mkdir -p api-test-files/inventory-logs
LOG_FILE="api-test-files/inventory-logs/inventory_test_$(date +%Y%m%d_%H%M%S).log"
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
    # Try registering if login fails
    echo "Login failed, trying to register..."
    REG_RES=$(curl -s -X POST "$BASE_URL/api/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"Admin\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"role\":\"admin\"}")
    TOKEN=$(echo "$REG_RES" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
        # Try login again (maybe register said user already exists but didn't return token? not usual behavior but safe fallback)
        LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
        TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    fi
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    print_status "FAILED" "Authentication failed. Cannot proceed."
    exit 1
else
    print_status "SUCCESS" "Authentication successful"
fi

RunID=$(date +%s)

echo ""
echo "--- CATEGORIES (174-180) ---"
# 176. Create Category
CAT_NAME="Category $RunID"
api_call "176. Create Category" "POST" "/api/categories" "{\"name\":\"$CAT_NAME\"}"
CAT_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 174. List Categories
api_call "174. List Categories" "GET" "/api/categories" ""

# 175. Get Category
api_call "175. Get Category Details" "GET" "/api/categories/$CAT_ID" ""

# 177. Update Category
api_call "177. Update Category" "PUT" "/api/categories/$CAT_ID" "{\"name\":\"Updated $CAT_NAME\"}"

# 179. Search Categories
api_call "179. Search Categories" "GET" "/api/categories/search?q=Updated" ""


echo ""
echo "--- UNITS (181-186) ---"
# 183. Create Unit
UNIT_NAME="Unit $RunID"
api_call "183. Create Unit" "POST" "/api/units" "{\"name\":\"$UNIT_NAME\",\"label\":\"pcs\",\"abbreviation\":\"pc\"}"
UNIT_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 181. List Units
api_call "181. List Units" "GET" "/api/units" ""

echo ""
echo "--- PRODUCTS (149-164) ---"
# 151. Create Product
PROD_NAME="Product $RunID"
SKU="SKU-$RunID"
api_call "151. Create Product" "POST" "/api/products" "{\"name\":\"$PROD_NAME\",\"sku\":\"$SKU\",\"category_id\":$CAT_ID,\"price\":100,\"cost_price\":50,\"unit\":\"$UNIT_NAME\",\"stock\":0,\"min_stock\":10}"
PROD_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 149. List Products
api_call "149. List Products" "GET" "/api/products" ""

# 150. Get Product Details
api_call "150. Get Product Details" "GET" "/api/products/$PROD_ID" ""

# 156. Get by SKU
api_call "156. Get Product by SKU" "GET" "/api/products/sku/$SKU" ""

# 160. Update Stock (Direct Patch)
api_call "160. Update Stock" "PATCH" "/api/products/$PROD_ID/stock" "{\"stock\":100}"

# 161. Toggle Status
api_call "161. Toggle Status" "PATCH" "/api/products/$PROD_ID/status" ""

echo ""
echo "--- PRODUCT IMAGES (165-168) ---"
# 166. Upload Image
api_call "166. Upload Product Image" "POST" "/api/products/$PROD_ID/images" "{\"image_url\":\"http://example.com/image.jpg\"}"
IMG_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 165. Get Images
api_call "165. Get Product Images" "GET" "/api/products/$PROD_ID/images" ""

# 168. Set Primary
api_call "168. Set Primary Image" "PATCH" "/api/products/images/$IMG_ID/primary" ""

# 167. Delete Image
api_call "167. Delete Product Image" "DELETE" "/api/products/images/$IMG_ID" ""

echo ""
echo "--- PRODUCT VARIANTS (169-173) ---"
# 170. Create Variant
api_call "170. Create Variant" "POST" "/api/products/$PROD_ID/variants" "{\"attribute_name\":\"Color\",\"attribute_value\":\"Red\",\"sku_suffix\":\"-RED\",\"price_adjustment\":10,\"stock\":50}"
VAR_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 169. Get Variants
api_call "169. Get Product Variants" "GET" "/api/products/$PROD_ID/variants" ""

# 171. Update Variant
api_call "171. Update Variant" "PUT" "/api/products/variants/$VAR_ID" "{\"attribute_name\":\"Color\",\"attribute_value\":\"Blue\",\"sku_suffix\":\"-BLUE\",\"price_adjustment\":15,\"stock\":60}"

# 173. Get by Attribute
api_call "173. Get Variants by Attribute" "GET" "/api/products/variants/attribute/Color" ""

# 172. Delete Variant
api_call "172. Delete Variant" "DELETE" "/api/products/variants/$VAR_ID" ""

echo ""
echo "--- INVENTORY MOVEMENTS (187-195) ---"
# 189. Record Movement (Purchase)
api_call "189. Record Movement (Purchase)" "POST" "/api/inventory-movements" "{\"product_id\":$PROD_ID,\"type\":\"purchase\",\"quantity\":50,\"reference\":\"PO-001\",\"reason\":\"Stock In\"}"

# 187. List Movements
api_call "187. List Movements" "GET" "/api/inventory-movements" ""

# 190. Get Product Movements
api_call "190. Get Product Movements" "GET" "/api/inventory-movements/product/$PROD_ID" ""

# 191. Get by Type
api_call "191. Get Movements by Type" "GET" "/api/inventory-movements/type/purchase" ""

# 194. Manual Adjustment
api_call "194. Manual Adjustment" "POST" "/api/inventory-movements/adjust" "{\"product_id\":$PROD_ID,\"quantity\":-5,\"reference\":\"ADJ-001\",\"reason\":\"Correction\"}"

# 195. Generate Report
api_call "195. Generate Movement Report" "GET" "/api/inventory-movements/report" ""

echo ""
echo "--- CLEANUP ---"
# Cleanup (Soft Delete)
api_call "153. Delete Product" "DELETE" "/api/products/$PROD_ID" ""
api_call "178. Delete Category" "DELETE" "/api/categories/$CAT_ID" ""
api_call "185. Delete Unit" "DELETE" "/api/units/$UNIT_ID" ""

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
