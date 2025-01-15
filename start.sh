#!/bin/bash

# Start the server
node dist/server.js &

# Start the bot
node dist/bot.js &

# Start the uptime monitor
node dist/uptime.js &

# Wait for all background processes
wait 