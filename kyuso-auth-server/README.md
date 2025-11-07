# kyuso Auth Server

A minimal OAuth2 Authorization Server with PKCE support using Supabase for authentication.

## Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Enable Google and GitHub OAuth providers in Authentication > Providers
   - Run the SQL commands from `supabase-tables.sql` in the SQL Editor

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

## Endpoints

- `GET /authorize` - OAuth2 authorization endpoint
- `POST /token` - OAuth2 token exchange endpoint  
- `GET /userinfo` - Get user profile with access token
- `POST /clients` - Register new OAuth client
- `GET /clients` - List registered clients

## OAuth2 Flow

1. Register client: `POST /clients`
2. Redirect user to: `GET /authorize?client_id=...&redirect_uri=...&response_type=code&code_challenge=...`
3. User logs in with Google/GitHub via Supabase
4. Exchange code for tokens: `POST /token`
5. Use access token: `GET /userinfo`

## Example Client Registration

```bash
curl -X POST http://localhost:3001/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "redirect_uri": "http://localhost:3000/callback"}'
```