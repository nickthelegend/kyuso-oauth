# QSO Wallet Connect - OAuth Modal UI

A React-based OAuth login modal that works as a popup window for seamless authentication.

## Features

- **Clean Modal Design** - Minimal, responsive UI with rounded corners
- **OAuth Providers** - Google and GitHub login via Supabase
- **Popup Behavior** - Opens as popup window, posts results to parent
- **PKCE Support** - Secure OAuth2 flow with code challenge

## Usage

### As Popup Window

```javascript
// Open popup from your main application
const popup = window.open(
  'http://localhost:5173?client_id=your_client_id&redirect_uri=http://localhost:3000/callback&code_challenge=xyz&state=abc',
  'oauth',
  'width=400,height=600'
)

// Listen for auth result
window.addEventListener('message', (event) => {
  if (event.data?.type === 'OAUTH_RESULT') {
    console.log('Auth code:', event.data.code)
    // Exchange code for tokens with your backend
  }
})
```

### Using Utility Functions

```javascript
import { openOAuthPopup } from './utils/oauth'

const result = await openOAuthPopup({
  clientId: 'your_client_id',
  redirectUri: 'http://localhost:3000/callback',
  authServerUrl: 'http://localhost:5173'
})

if (result.code) {
  // Exchange code for access token
}
```

## Development

```bash
npm install
npm run dev
```

## Routes

- `/` - Main login modal
- `/popup-complete` - Handles OAuth callback and posts result to parent

## Integration

This modal integrates with the kyuso-auth-server backend for complete OAuth2 flow with Google/GitHub authentication via Supabase.