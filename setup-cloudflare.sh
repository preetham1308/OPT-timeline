#!/bin/bash

# 🚀 Cloudflare Workers Setup Script for USCIS API
# This script automates the deployment process

echo "🚀 Setting up Cloudflare Workers for USCIS API Integration..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install Wrangler CLI globally
echo "📦 Installing Wrangler CLI..."
npm install -g wrangler

if [ $? -eq 0 ]; then
    echo "✅ Wrangler CLI installed successfully"
else
    echo "❌ Failed to install Wrangler CLI"
    exit 1
fi

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI installation failed"
    exit 1
fi

echo ""
echo "🔐 Next Steps:"
echo "1. Run: wrangler login"
echo "2. Get your Cloudflare Account ID from dashboard"
echo "3. Update wrangler.toml with your account ID and domain"
echo "4. Set environment variables in Cloudflare dashboard:"
echo "   - USCIS_CLIENT_ID = 6EIUT4iZRYpDfISXWESe4QCZMenjGCyJ"
echo "   - USCIS_CLIENT_SECRET = IXIGfy5TpaQKX1jE"
echo "5. Run: wrangler publish"
echo ""
echo "📚 See CLOUDFLARE_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎯 Your USCIS API will be available at: https://uscis.yourdomain.com/"
echo "🔒 Credentials will be securely stored in Cloudflare environment variables"
echo "✅ No more security warnings in your frontend code!" 