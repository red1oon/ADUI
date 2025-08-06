#!/bin/bash
# Start external metadata server for ADUI development with dynamic network detection

CURRENT_DIR=$(basename $(pwd))
METADATA_DIR="../${CURRENT_DIR}-metadata-server"

if [ ! -d "$METADATA_DIR" ]; then
    echo "❌ Metadata server directory not found: $METADATA_DIR"
    echo "Please run external metadata setup first"
    exit 1
fi

echo "🌐 Starting ADUI External Metadata Server..."
echo ""

# Dynamic network interface detection
echo "📡 Detecting Network Configuration..."

# Method 1: Get IP from default route interface (most reliable)
if command -v ip >/dev/null 2>&1; then
    # Get the interface used for default route
    DEFAULT_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n 1)
    if [ -n "$DEFAULT_INTERFACE" ]; then
        # Get IP address of that interface
        SERVER_IP=$(ip addr show "$DEFAULT_INTERFACE" | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | cut -d'/' -f1 | head -n 1)
    fi
fi

# Method 2: Fallback to hostname -I (if Method 1 fails)
if [ -z "$SERVER_IP" ] && command -v hostname >/dev/null 2>&1; then
    SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null)
fi

# Method 3: Last resort - parse all interfaces
if [ -z "$SERVER_IP" ]; then
    if command -v ip >/dev/null 2>&1; then
        SERVER_IP=$(ip addr | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | cut -d'/' -f1 | head -n 1)
    elif command -v ifconfig >/dev/null 2>&1; then
        SERVER_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v 127.0.0.1 | head -n 1)
    fi
fi

# Final fallback
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
    echo "   ⚠️  Could not detect network IP, using localhost"
    echo "   💡 Server may not be accessible from mobile devices"
else
    echo "   ✅ Detected primary network interface: $SERVER_IP"
fi

echo ""
echo "🔧 Server Configuration:"
echo "   📍 Server will bind to: 0.0.0.0:3001 (all interfaces)"
echo "   📱 Mobile devices should use: http://$SERVER_IP:3001"
echo "   🔍 Health check endpoint: http://$SERVER_IP:3001/health"
echo "   🖥️  Local access: http://localhost:3001"
echo ""

# Show app.json configuration hint
echo "📝 Update your app.json with:"
echo "   \"metadataBaseUrl\": \"http://$SERVER_IP:3001\""
echo ""

cd "$METADATA_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing metadata server dependencies..."
    npm install
    echo ""
fi

# Pre-flight checks
echo "🧪 Pre-flight Checks:"

# Check if port 3001 is available
if command -v lsof >/dev/null 2>&1; then
    if lsof -i :3001 >/dev/null 2>&1; then
        echo "   ⚠️  Port 3001 appears to be in use"
        echo "   🔧 To kill existing process: lsof -ti:3001 | xargs kill -9"
        echo ""
    else
        echo "   ✅ Port 3001 is available"
    fi
elif command -v netstat >/dev/null 2>&1; then
    if netstat -ln | grep -q ":3001"; then
        echo "   ⚠️  Port 3001 appears to be in use"
        echo ""
    else
        echo "   ✅ Port 3001 is available"
    fi
fi

# Test network connectivity (optional)
echo "   📶 Testing network connectivity..."
if ping -c 1 -W 1 8.8.8.8 >/dev/null 2>&1; then
    echo "   ✅ Network connectivity OK"
else
    echo "   ⚠️  Network connectivity issues detected"
fi

echo ""
echo "🚀 Starting metadata server..."
echo "   📱 Ensure your mobile device is on the same WiFi network!"
echo "   🔧 Use Ctrl+C to stop the server"
echo ""

# Start the server
npm start

# If we get here, server stopped
echo ""
echo "🛑 Metadata server stopped."
echo "📊 Final connection info:"
echo "   Server was accessible at: http://$SERVER_IP:3001"
