#!/bin/bash
# Quick test to verify maintenance endpoints

echo "Testing Maintenance Endpoints..."
echo "=================================="

TOKEN="your-auth-token"  # Replace with actual token from login
BASE_URL="http://localhost:5001/api"

echo ""
echo "1. Testing GET /api/maintenance (All records):"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/maintenance" | json_pp | head -20

echo ""
echo "2. Testing GET /api/maintenance/scheduled/upcoming (Upcoming 30 days):"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/maintenance/scheduled/upcoming?days=30" | json_pp | head -20

echo ""
echo "3. Testing GET /api/maintenance/scheduled/overdue (Overdue):"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/maintenance/scheduled/overdue" | json_pp | head -20

echo ""
echo "4. Testing GET /api/maintenance/stats (Statistics):"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/maintenance/stats" | json_pp

echo ""
echo "=================================="
echo "Test Complete!"
