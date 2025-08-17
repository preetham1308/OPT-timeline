# 🚀 Cloudflare Workers Deployment Guide for USCIS API

## 📋 Prerequisites
- Cloudflare account with a domain
- USCIS API credentials (Client ID & Secret)
- Node.js installed (for Wrangler CLI)

## 🔧 Step-by-Step Setup

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Get Your Cloudflare Account ID
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- Look at the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>`
- Copy the `<ACCOUNT_ID>` part

### 4. Update Configuration
Edit `wrangler.toml`:
```toml
account_id = "YOUR_ACTUAL_ACCOUNT_ID"
routes = [
  { pattern = "uscis.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### 5. Set Environment Variables in Cloudflare
- Go to [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers)
- Click on your worker
- Go to "Settings" → "Environment Variables"
- Add:
  - `USCIS_CLIENT_ID` = `6EIUT4iZRYpDfISXWESe4QCZMenjGCyJ`
  - `USCIS_CLIENT_SECRET` = `IXIGfy5TpaQKX1jE`

### 6. Deploy the Worker
```bash
wrangler publish
```

### 7. Test the Worker
```bash
curl -X POST "https://uscis.yourdomain.com/" \
  -H "Content-Type: application/json" \
  -d '{"receiptNumber": "EAC9999103403"}'
```

## 🔒 Security Features

✅ **Credentials Protected**: Stored in Cloudflare environment variables
✅ **CORS Handled**: Proper cross-origin request handling
✅ **Input Validation**: Receipt number format validation
✅ **Error Handling**: Comprehensive error responses
✅ **Rate Limiting**: Cloudflare's built-in DDoS protection

## 🌐 Frontend Integration

Update your frontend code to call the Cloudflare Worker:

```javascript
// Replace the insecure direct API call with:
const response = await fetch('https://uscis.yourdomain.com/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    receiptNumber: 'EAC9999103403'
  })
});

const data = await response.json();
console.log('Case Status:', data.status);
```

## 📊 Monitoring & Analytics

- **Cloudflare Analytics**: Built-in request monitoring
- **Error Logs**: View in Cloudflare dashboard
- **Performance**: Global CDN for fast responses

## 🚨 Troubleshooting

### Common Issues:

1. **"Credentials not configured"**
   - Check environment variables in Cloudflare dashboard
   - Ensure variable names match exactly

2. **CORS errors**
   - Worker handles CORS automatically
   - Check if your domain is properly configured

3. **Deployment fails**
   - Verify account ID in wrangler.toml
   - Check if you're logged in with `wrangler whoami`

## 💰 Cost

- **Free Tier**: 100,000 requests/day
- **Paid**: $5/month for additional requests
- **Your Use Case**: Likely free forever

## 🎯 Benefits

✅ **Secure**: No credentials in frontend code
✅ **Fast**: Global CDN deployment
✅ **Scalable**: Handles traffic spikes automatically
✅ **Simple**: Just deploy and use
✅ **Your Domain**: Professional API endpoint

## 🔄 Updates

To update the worker:
```bash
wrangler publish
```

## 📞 Support

- Cloudflare Workers: [Documentation](https://developers.cloudflare.com/workers/)
- Wrangler CLI: [GitHub](https://github.com/cloudflare/wrangler)
- Your domain: Managed through Cloudflare dashboard 