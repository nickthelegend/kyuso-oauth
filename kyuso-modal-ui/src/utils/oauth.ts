// OAuth utility functions for client integration

export interface OAuthConfig {
  clientId: string
  redirectUri: string
  authServerUrl?: string
}

export interface OAuthResult {
  code?: string
  state?: string
  error?: string
}

// Generate PKCE code verifier and challenge
export function generatePKCE() {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = base64URLEncode(sha256(codeVerifier))
  return { codeVerifier, codeChallenge }
}

// Open OAuth popup window
export function openOAuthPopup(config: OAuthConfig): Promise<OAuthResult> {
  const { codeVerifier, codeChallenge } = generatePKCE()
  const state = generateRandomString(32)
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state
  })

  const authUrl = `${config.authServerUrl || 'http://localhost:3000'}?${params}`
  
  return new Promise((resolve) => {
    const popup = window.open(authUrl, 'oauth', 'width=400,height=600,scrollbars=yes,resizable=yes')
    
    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_RESULT') {
        window.removeEventListener('message', messageHandler)
        resolve({
          code: event.data.code,
          state: event.data.state,
          error: event.data.error
        })
      }
    }
    
    window.addEventListener('message', messageHandler)
    
    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        resolve({ error: 'popup_closed' })
      }
    }, 1000)
  })
}

// Helper functions
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function sha256(plain: string): ArrayBuffer {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}