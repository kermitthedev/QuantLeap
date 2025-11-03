#!/bin/bash

echo "🚀 Starting Options Pricing Engine..."
echo ""

# Start backend in background
echo "📊 Starting backend API server..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ..
echo "🎨 Starting frontend..."
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
