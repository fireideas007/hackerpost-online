#!/usr/bin/env bash
# ==============================================================================
# HackerPost.online — AWS Automated Production Setup & Deployment Script
# Supports: Ubuntu 22.04/24.04 LTS & Amazon Linux 2023 (EC2 / Lightsail)
# ==============================================================================

set -euo pipefail

DOMAIN="hackerpost.online"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "======================================================"
echo "   HackerPost AWS Production Deployment Assistant     "
echo "======================================================"
echo "Target Domain: $DOMAIN"
echo "Application Directory: $APP_DIR"
echo ""

# 1. Check Node.js and PM2
if ! command -v node &> /dev/null; then
    echo "[-] Node.js not found. Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "[+] Node version: $(node -v)"
echo "[+] NPM version: $(npm -v)"

# 2. Check or install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "[+] Installing PM2 process manager globally..."
    sudo npm install -g pm2
fi

# 3. Prepare Environment
cd "$APP_DIR"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "[+] Creating .env from .env.example..."
        cp .env.example .env
        echo "[!] Please edit $APP_DIR/.env with your production secrets!"
    else
        touch .env
    fi
fi

# 4. Install Dependencies & Build Next.js
echo "[+] Installing project dependencies..."
npm ci --prefer-offline --no-audit

echo "[+] Generating optimized production build..."
npm run build

# 5. Start or Reload Application with PM2
echo "[+] Starting HackerPost under PM2 management..."
pm2 describe hackerpost &>/dev/null && pm2 reload hackerpost || pm2 start npm --name "hackerpost" -- start -- -p 3000

pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$USER" --hp "$HOME" || true

# 6. Setup Automated Hourly Threat Harvester & Daily Benchmark Cron
echo "[+] Setting up hourly threat syndication & daily benchmark crons..."
CRON_AGENT="0 * * * * curl -s -X POST http://localhost:3000/api/agent/cron > /dev/null 2>&1"
CRON_BENCH="0 6 * * * curl -s 'http://localhost:3000/api/benchmarks/cron?force=true' > /dev/null 2>&1"
(crontab -l 2>/dev/null | grep -Fv "api/agent/cron" | grep -Fv "api/benchmarks/cron"; echo "$CRON_AGENT"; echo "$CRON_BENCH") | crontab -

echo ""
echo "======================================================"
echo "   HackerPost is LIVE and managed by PM2!             "
echo "======================================================"
echo "Status: pm2 status"
echo "Logs:   pm2 logs hackerpost"
echo "URL:    http://localhost:3000"
echo ""
echo "To connect Nginx with free SSL (Let's Encrypt), run:"
echo "sudo apt install -y nginx certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
