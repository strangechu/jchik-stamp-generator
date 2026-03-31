#!/bin/bash
set -e

echo "==> Pulling latest code..."
git pull origin master

echo "==> Installing dependencies..."
npm install --production=false

echo "==> Cleaning previous build..."
rm -rf .next

echo "==> Building..."
npm run build

echo "==> Restarting service..."
if pm2 list | grep -q "jchik-stamp"; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

echo "==> Done. App running at http://localhost:3000"
