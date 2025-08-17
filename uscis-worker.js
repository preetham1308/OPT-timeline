// Cloudflare Worker for USCIS API Integration
// Deploy this to Cloudflare Workers to securely handle USCIS API calls

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Parse the request body
    const { receiptNumber } = await request.json()
    
    if (!receiptNumber) {
      return new Response('Receipt number is required', { status: 400 })
    }

    // Validate receipt number format
    if (!/^[a-zA-Z]{3}[0-9]{10}$/.test(receiptNumber.replace(/-/g, ''))) {
      return new Response('Invalid receipt number format', { status: 400 })
    }

    // Get USCIS access token
    const accessToken = await getUSCISAccessToken()
    
    // Call USCIS API
    const uscisResponse = await callUSCISAPI(receiptNumber, accessToken)
    
    // Return the response
    return new Response(JSON.stringify(uscisResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Worker error:', error)
    
    return new Response(JSON.stringify({
      error: 'Failed to process request',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

async function getUSCISAccessToken() {
  // Get credentials from Cloudflare environment variables
  const CLIENT_ID = USCIS_CLIENT_ID // Set this in Cloudflare dashboard
  const CLIENT_SECRET = USCIS_CLIENT_SECRET // Set this in Cloudflare dashboard
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('USCIS credentials not configured')
  }

  const response = await fetch('https://api-int.uscis.gov/oauth/accesstoken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token request failed: ${response.status} - ${errorText}`)
  }

  const tokenData = await response.json()
  return tokenData.access_token
}

async function callUSCISAPI(receiptNumber, accessToken) {
  const cleanReceipt = receiptNumber.replace(/-/g, '')
  
  const response = await fetch(`https://api-int.uscis.gov/case-status/${cleanReceipt}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`USCIS API failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  // Transform the response to match our frontend format
  return {
    receiptNumber: receiptNumber,
    status: data.case_status?.current_case_status_text_en || 'Unknown',
    description: data.case_status?.current_case_status_desc_en || 'No description available',
    lastUpdated: data.case_status?.modifiedDate || 'Unknown',
    formType: data.case_status?.formType || 'Unknown',
    submittedDate: data.case_status?.submittedDate || 'Unknown',
    isSandbox: true,
    rawData: data
  }
} 