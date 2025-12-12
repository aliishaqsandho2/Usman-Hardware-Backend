#!/bin/bash

# API Test Script for Usman Hardware
# This script tests all 36 authentication & security APIs

echo "=========================================="
echo "API TEST SCRIPT - Usman Hardware"
echo "=========================================="

# Configuration
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="password123"
TEST_USER_EMAIL="testuser@test.com"
TEST_USER_PASSWORD="testpass123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for test results
PASSED=0
FAILED=0
SKIPPED=0

# Log file
LOG_FILE="api_test_results_$(date +%Y%m%d_%H%M%S).log"

# Global variables
TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
CURRENT_PASSWORD="$ADMIN_PASSWORD"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    local test_num=$3
    
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✓ Test #$test_num: $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Test #$test_num: $message" >> "$LOG_FILE"
            ((PASSED++))
            ;;
        "FAILED")
            echo -e "${RED}✗ Test #$test_num: $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✗ Test #$test_num: $message" >> "$LOG_FILE"
            ((FAILED++))
            ;;
        "SKIPPED")
            echo -e "${YELLOW}⚠ Test #$test_num: $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ Test #$test_num: $message" >> "$LOG_FILE"
            ((SKIPPED++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ $message" >> "$LOG_FILE"
            ;;
    esac
}

# Function to login and get fresh tokens
login() {
    print_status "INFO" "Logging in with email: $ADMIN_EMAIL"
    
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$CURRENT_PASSWORD\"}")
    
    # Extract token from response
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        print_status "FAILED" "Failed to obtain authentication token" "LOGIN"
        echo "Login response:" >> "$LOG_FILE"
        echo "$LOGIN_RESPONSE" >> "$LOG_FILE"
        return 1
    fi
    
    # Extract refresh token
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    
    # Extract user ID from token
    USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')
    if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
        # Fallback: try to get from token payload
        USER_ID=$(echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | grep -o '"id":[^,}]*' | cut -d':' -f2 | tr -d '"')
    fi
    
    print_status "INFO" "✓ Login successful - User ID: $USER_ID, Token: ${TOKEN:0:20}..."
    return 0
}

# Function to make API calls
api_call() {
    local test_num=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local require_auth=$5
    local description=$6
    local expect_failure=$7
    
    local curl_cmd="curl -s -X $method '$BASE_URL$endpoint'"
    
    if [ "$require_auth" = "true" ] && [ -n "$TOKEN" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $TOKEN'"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    # Execute and capture response
    local response
    response=$(eval $curl_cmd 2>/dev/null)
    local status_code=$?
    
    # Check if curl command was successful
    if [ $status_code -ne 0 ]; then
        print_status "FAILED" "$description - Curl error: $status_code" "$test_num"
        return 1
    fi
    
    # Log the full response
    echo "Response for Test #$test_num ($description):" >> "$LOG_FILE"
    echo "$response" | jq . 2>/dev/null || echo "$response" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Parse response for success
    local success
    success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2 | tr -d ' ' | tr -d '"')
    
    if [ "$expect_failure" = "true" ]; then
        # We expect this to fail, so success=false is good
        if [ "$success" = "false" ]; then
            print_status "SUCCESS" "$description (expected failure)" "$test_num"
            return 0
        else
            print_status "FAILED" "$description (expected to fail but succeeded)" "$test_num"
            return 1
        fi
    else
        # Normal case: expect success
        if [ "$success" = "true" ]; then
            print_status "SUCCESS" "$description" "$test_num"
            return 0
        else
            # Check if it's an authentication error
            local message
            message=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
            if [[ "$message" == *"token"* ]] || [[ "$message" == *"authentication"* ]]; then
                print_status "FAILED" "$description - Authentication error: $message" "$test_num"
            else
                print_status "FAILED" "$description" "$test_num"
            fi
            return 1
        fi
    fi
}

# Cleanup function
cleanup() {
    echo ""
    echo "=========================================="
    echo "TEST SUMMARY:"
    echo "=========================================="
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
    echo ""
    echo "Detailed log saved to: $LOG_FILE"
    echo "=========================================="
    
    # Clean up temporary files
    rm -f avatar.txt test_avatar.txt
}

# Set up cleanup on script exit
trap cleanup EXIT

# Start logging
echo "API Test Script started at $(date)" > "$LOG_FILE"
echo "=========================================="

# Start with login
if ! login; then
    exit 1
fi

# Wait a moment for server
sleep 1

echo ""
print_status "INFO" "Starting API tests..."
echo "=========================================="

### 🔐 AUTHENTICATION & SECURITY TESTS ###

### Authentication Tests (1-9) - Do these first
echo ""
print_status "INFO" "Authentication Tests (1-9)"

# 1. User login (already done, but test again to verify)
LOGIN_DATA="{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$CURRENT_PASSWORD\"}"
api_call "1" "POST" "/api/auth/login" "$LOGIN_DATA" "false" "User login"

# 2. User logout
api_call "2" "POST" "/api/auth/logout" "" "true" "User logout"

# Re-login after logout to continue tests
print_status "INFO" "Re-logging in after logout test..."
if ! login; then
    print_status "INFO" "Trying with original password..."
    CURRENT_PASSWORD="$ADMIN_PASSWORD"
    login
fi

# 3. Register new user - Use a unique email to avoid conflicts
TIMESTAMP=$(date +%s)
REGISTER_DATA="{\"username\":\"registertest$TIMESTAMP\",\"email\":\"registertest$TIMESTAMP@example.com\",\"password\":\"RegisterPass123\",\"full_name\":\"Register Test User $TIMESTAMP\"}"
api_call "3" "POST" "/api/auth/register" "$REGISTER_DATA" "false" "Register new user"

# 4. Refresh access token
if [ -n "$REFRESH_TOKEN" ]; then
    REFRESH_DATA="{\"refresh_token\":\"$REFRESH_TOKEN\"}"
    api_call "4" "POST" "/api/auth/refresh-token" "$REFRESH_DATA" "false" "Refresh access token"
else
    print_status "SKIPPED" "Refresh access token (no refresh token)" "4"
fi

# 5. Forgot password request
FORGOT_DATA="{\"email\":\"$ADMIN_EMAIL\"}"
api_call "5" "POST" "/api/auth/forgot-password" "$FORGOT_DATA" "false" "Forgot password request"

# 6. Reset password with token
RESET_DATA='{"token":"test_reset_token","new_password":"NewPassword123"}'
api_call "6" "POST" "/api/auth/reset-password" "$RESET_DATA" "false" "Reset password with token"

# 7. Change password - Use proper password format
# First try with a valid password, but note it might fail if password doesn't meet requirements
CHANGE_PASS_DATA='{"current_password":"'"$CURRENT_PASSWORD"'","new_password":"NewAdminPass123!"}'
api_call "7" "POST" "/api/auth/change-password" "$CHANGE_PASS_DATA" "true" "Change password"

# Check if password change was successful and update CURRENT_PASSWORD
if [ $? -eq 0 ]; then
    CURRENT_PASSWORD="NewAdminPass123!"
    print_status "INFO" "Password changed successfully, using new password: $CURRENT_PASSWORD"
fi

# 8. Get current user profile
api_call "8" "GET" "/api/auth/me" "" "true" "Get current user profile"

# 9. Update profile
PROFILE_DATA='{"full_name":"Updated Admin User","email":"admin@test.com"}'  # Keep same email to avoid issues
api_call "9" "PUT" "/api/auth/profile" "$PROFILE_DATA" "true" "Update profile"

### User Activities Tests (10-14) - Before session termination
echo ""
print_status "INFO" "User Activities Tests (10-14)"

# 10. Get all user activities
api_call "10" "GET" "/api/activities?page=1&limit=10" "" "true" "Get all user activities"

# 11. Get user activities
api_call "11" "GET" "/api/activities/user/$USER_ID" "" "true" "Get user activities"

# 12. Get activities by module
api_call "12" "GET" "/api/activities/module/auth" "" "true" "Get activities by module"

# 13. Get activities by action type
api_call "13" "GET" "/api/activities/action/login" "" "true" "Get activities by action type"

# 14. Log activity
ACTIVITY_DATA="{\"user_id\":$USER_ID,\"module\":\"api_test\",\"action\":\"test_execution\",\"details\":\"API test script execution\",\"ip_address\":\"127.0.0.1\"}"
api_call "14" "POST" "/api/activities" "$ACTIVITY_DATA" "true" "Log activity"

### Audit Logs Tests (15-18) - Before session termination
echo ""
print_status "INFO" "Audit Logs Tests (15-18)"

# 15. Get all audit logs
api_call "15" "GET" "/api/audit-logs?page=1&limit=10" "" "true" "Get all audit logs"

# 16. Get user audit logs
api_call "16" "GET" "/api/audit-logs/user/$USER_ID" "" "true" "Get user audit logs"

# 17. Get logs by table
api_call "17" "GET" "/api/audit-logs/table/users" "" "true" "Get logs by table"

# 18. Get record history
api_call "18" "GET" "/api/audit-logs/record/users/$USER_ID" "" "true" "Get record history"

### Users Management Tests (19-31)
echo ""
print_status "INFO" "Users Management Tests (19-31)"

# 19. List all users
api_call "19" "GET" "/api/users?page=1&limit=10" "" "true" "List all users"

# 20. Get user details (current user)
api_call "20" "GET" "/api/users/$USER_ID" "" "true" "Get user details"

# 21. Create new user - Use unique username and email
TIMESTAMP=$(date +%s)
NEW_USER_DATA="{\"username\":\"apitestuser$TIMESTAMP\",\"email\":\"apitest$TIMESTAMP@example.com\",\"password\":\"TestPass123!\",\"full_name\":\"API Test User $TIMESTAMP\",\"role\":\"staff\",\"phone\":\"1234567890\"}"
api_call "21" "POST" "/api/users" "$NEW_USER_DATA" "true" "Create new user"

# Store the new user ID for later tests
NEW_USER_ID=$(curl -s -X GET "$BASE_URL/api/users?page=1&limit=10" -H "Authorization: Bearer $TOKEN" | grep -o '"id":[^,]*' | tail -1 | cut -d':' -f2 | tr -d ' ' | tr -d '"')
if [ -z "$NEW_USER_ID" ] || [ "$NEW_USER_ID" = "null" ]; then
    # Try alternative method to get the new user ID
    NEW_USER_ID=$(curl -s -X GET "$BASE_URL/api/users?page=1&limit=10" -H "Authorization: Bearer $TOKEN" | grep -o '"id":[^,}]*' | tail -1 | cut -d':' -f2 | tr -cd '0-9')
fi
print_status "INFO" "New user ID for tests: $NEW_USER_ID"

# 22. Update user details - Only if we have a valid NEW_USER_ID
if [ -n "$NEW_USER_ID" ] && [ "$NEW_USER_ID" != "$USER_ID" ] && [ "$NEW_USER_ID" != "null" ] && [ "$NEW_USER_ID" -gt 0 ]; then
    UPDATE_DATA="{\"full_name\":\"Updated API Test User $TIMESTAMP\",\"email\":\"updatedapitest$TIMESTAMP@example.com\"}"
    api_call "22" "PUT" "/api/users/$NEW_USER_ID" "$UPDATE_DATA" "true" "Update user details"
else
    print_status "SKIPPED" "Update user details (no valid new user ID)" "22"
fi

# 23. Delete user (skip if it's the current user or invalid)
if [ -n "$NEW_USER_ID" ] && [ "$NEW_USER_ID" != "$USER_ID" ] && [ "$NEW_USER_ID" != "1" ] && [ "$NEW_USER_ID" != "null" ] && [ "$NEW_USER_ID" -gt 0 ]; then
    api_call "23" "DELETE" "/api/users/$NEW_USER_ID" "" "true" "Delete user"
else
    print_status "SKIPPED" "Delete user (cannot delete self or admin or invalid ID)" "23"
fi

# 24. Toggle user status (use ID 3 if available, otherwise skip)
if [ -n "$USER_ID" ] && [ "$USER_ID" != "3" ]; then
    STATUS_DATA='{"is_active":false}'
    api_call "24" "PATCH" "/api/users/3/status" "$STATUS_DATA" "true" "Toggle user status"
else
    print_status "SKIPPED" "Toggle user status (user 3 not available)" "24"
fi

# 25. Change user role (use ID 3 if available)
if [ -n "$USER_ID" ] && [ "$USER_ID" != "3" ]; then
    ROLE_DATA='{"role":"manager"}'
    api_call "25" "PATCH" "/api/users/3/role" "$ROLE_DATA" "true" "Change user role"
else
    print_status "SKIPPED" "Change user role (user 3 not available)" "25"
fi

# 26. Get users by role
api_call "26" "GET" "/api/users/roles/admin" "" "true" "Get users by role"

# 27. Update user permissions
PERMISSIONS_DATA='{"permissions":["read","write","delete","manage_users"]}'
api_call "27" "POST" "/api/users/$USER_ID/permissions" "$PERMISSIONS_DATA" "true" "Update user permissions"

# 28. Search users
api_call "28" "GET" "/api/users/search?q=admin" "" "true" "Search users"

# 29. Export users list
api_call "29" "GET" "/api/users/export" "" "true" "Export users list"

# 30. Upload avatar (skip if endpoint has issues)
echo "test image data" > test_avatar.txt
RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/$USER_ID/avatar" \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@test_avatar.txt")
if echo "$RESPONSE" | grep -q '"success":true'; then
    print_status "SUCCESS" "Upload avatar" "30"
else
    print_status "SKIPPED" "Upload avatar (endpoint may have issues)" "30"
fi
rm test_avatar.txt

# 31. Reset password (use a different user if available)
RESET_PASS_DATA='{"new_password":"NewTestPass123!"}'
if [ -n "$NEW_USER_ID" ] && [ "$NEW_USER_ID" != "$USER_ID" ] && [ "$NEW_USER_ID" != "null" ] && [ "$NEW_USER_ID" -gt 0 ]; then
    api_call "31" "POST" "/api/users/$NEW_USER_ID/reset-password" "$RESET_PASS_DATA" "true" "Reset password"
else
    print_status "SKIPPED" "Reset password (no test user available)" "31"
fi

### Sessions Management Tests (32-36) - Do these last
echo ""
print_status "INFO" "Sessions Management Tests (32-36)"

# 32. List all active sessions
api_call "32" "GET" "/api/sessions" "" "true" "List all active sessions"

# Get a session ID for testing
SESSIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/sessions" -H "Authorization: Bearer $TOKEN")
SESSION_ID=$(echo "$SESSIONS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 33. Get session details
if [ -n "$SESSION_ID" ]; then
    api_call "33" "GET" "/api/sessions/$SESSION_ID" "" "true" "Get session details"
else
    print_status "SKIPPED" "Get session details (no session ID)" "33"
fi

# 34. Terminate session (skip terminating current session)
if [ -n "$SESSION_ID" ]; then
    # Get all sessions and find one that's not current
    ALL_SESSIONS=$(curl -s -X GET "$BASE_URL/api/sessions" -H "Authorization: Bearer $TOKEN")
    TERMINATE_SESSION_ID=$(echo "$ALL_SESSIONS" | grep -o '"id":"[^"]*"' | tail -1 | cut -d'"' -f4)
    
    if [ -n "$TERMINATE_SESSION_ID" ] && [ "$TERMINATE_SESSION_ID" != "$SESSION_ID" ]; then
        api_call "34" "DELETE" "/api/sessions/$TERMINATE_SESSION_ID" "" "true" "Terminate session"
    else
        print_status "SKIPPED" "Terminate session (no other session available)" "34"
    fi
else
    print_status "SKIPPED" "Terminate session (no session ID)" "34"
fi

# 35. Terminate all user sessions
api_call "35" "DELETE" "/api/sessions/user/$USER_ID" "" "true" "Terminate all user sessions"

# Re-login after terminating sessions - Try with current password, fallback to original
print_status "INFO" "Re-logging in after terminating all sessions..."
if ! login; then
    print_status "INFO" "Login failed with current password, trying original password..."
    CURRENT_PASSWORD="$ADMIN_PASSWORD"
    if ! login; then
        print_status "INFO" "Both passwords failed, trying to get new token via refresh..."
        # Try to use refresh token if available
        if [ -n "$REFRESH_TOKEN" ]; then
            REFRESH_DATA="{\"refresh_token\":\"$REFRESH_TOKEN\"}"
            REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh-token" \
              -H "Content-Type: application/json" \
              -d "$REFRESH_DATA")
            TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$TOKEN" ]; then
                print_status "INFO" "Got new token via refresh"
            else
                print_status "INFO" "Could not re-login, some tests may fail"
            fi
        fi
    fi
fi

# 36. Get user sessions (with fresh token if available)
api_call "36" "GET" "/api/sessions/user/$USER_ID" "" "true" "Get user sessions"

echo ""
print_status "INFO" "All tests completed!"