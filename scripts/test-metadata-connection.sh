#!/bin/bash

# Test external metadata server connection

METADATA_URL="http://192.168.32.144:3001"

echo "🔍 Testing metadata server connection..."
echo "📡 Testing server at: $METADATA_URL"
echo ""

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found. Installing basic JSON formatting..."
    JSON_FORMAT="cat"
else
    JSON_FORMAT="jq ."
fi

# Test if server is reachable
echo "🌐 Testing server reachability..."
if curl -s --connect-timeout 5 "$METADATA_URL/health" >/dev/null 2>&1; then
    echo "✅ Server is reachable!"
else
    echo "❌ Server not reachable. Is the metadata server running?"
    echo "   Start with: ./scripts/start-metadata-server.sh"
    exit 1
fi

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
curl -s "$METADATA_URL/health" | $JSON_FORMAT || echo "❌ Health check failed"

# Test windows list
echo ""
echo "📋 Testing windows list..."
curl -s "$METADATA_URL/windows" | $JSON_FORMAT || echo "❌ Windows list failed"

# Test specific window
echo ""
echo "🔍 Testing specific window..."
curl -s "$METADATA_URL/windows/EQUIP_INSPECTION" 2>/dev/null | grep -o '"name":"[^"]*"' || echo "❌ Window fetch failed"

echo ""
echo "✅ Metadata server tests complete"
echo ""
echo "📱 Phone Connectivity Test:"
echo "   1. Ensure phone and computer on same WiFi"
echo "   2. On phone browser, visit: $METADATA_URL/health"
echo "   3. Should show server health status"
echo ""
echo "🔧 If phone can't connect:"
echo "   • Check WiFi networks match"
echo "   • Check firewall settings"
echo "   • Try computer IP manually: 192.168.32.144"
