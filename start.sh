#!/bin/bash

# Exit on any error
set -e

echo "Starting services..."

# Start the server
echo "Starting server..."
node dist/server.js &
SERVER_PID=$!

# Start the bot
echo "Starting bot..."
node dist/bot.js &
BOT_PID=$!

# Start the uptime monitor
echo "Starting uptime monitor..."
node dist/uptime.js &
UPTIME_PID=$!

# Function to cleanup processes
cleanup() {
    echo "Cleaning up processes..."
    kill $SERVER_PID $BOT_PID $UPTIME_PID 2>/dev/null
}

# Setup cleanup on script exit
trap cleanup EXIT

# Wait for all processes
wait 