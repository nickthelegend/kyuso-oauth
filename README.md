# Kyuso OAuth

> A self-hosted OAuth2 authorization server with PKCE, plus a popup login modal and an example client — social login (Google / GitHub) powered by Supabase.

## Overview

Kyuso OAuth is a small, end-to-end OAuth2 stack that lets your own apps offer "Connect with Kyuso" style sign-in. A Fastify-based authorization server implements the standard `authorize` → `token` → `userinfo` flow with PKCE, delegating the actual identity check to Supabase Auth (Google and GitHub providers). A React popup modal handles the login UI, and a separate example app shows how a client integrates the whole thing.

The repo is organized as three independent packages: the auth server, the modal UI that runs as a popup window, and a demo client that ties them together.

## Features

- **OAuth2 Authorization Code flow with PKCE** — `S256` code-challenge verification on the token endpoint.
- **Standard endpoints** — `GET /authorize`, `POST /token`, `GET /userinfo`, plus `POST /clients` / `GET /clients` for client registration.
- **Social login via Supabase** — Google and GitHub sign-in through Supabase Auth providers.
- **Short-lived auth codes & refresh tokens** — authorization codes expire in 10 minutes and are single-use; JWT access tokens (HS256, signed with `jose`) last 1 hour; opaque refresh tokens last 30 days.
- **Popup login modal** — a React (Vite) UI that opens as a popup, runs the login, and returns the result to the opener via `postMessage`.
- **Example client app** — a React demo that generates a PKCE verifier, opens the modal, exchanges the code for tokens, and fetches user info.
- **Supabase schema included** — ready-to-run SQL for the `oauth_clients`, `oauth_auth_codes`, and `oauth_refresh_tokens` tables.

## Tech Stack

- **Auth server:** Node.js (ESM), Fastify 4, `@fastify/cors` / `@fastify/cookie` / `@fastify/session`, `@supabase/supabase-js`, `jose` (JWT), Node `crypto`.
- **Modal UI:** React 19, React Router 6, TypeScript, Vite 7.
- **Example app:** React 19, TypeScript, Vite 7.
- **Identity & storage:** Supabase (Auth + Postgres).

## Getting Started

The three packages run together. Default ports: auth server `3001`, modal UI `5173`, example app `5174`.

```bash
# 1. Auth server
cd kyuso-auth-server
cp .env.example .env          # fill in your Supabase URL + keys and a JWT secret
# Run the SQL in supabase-tables.sql inside your Supabase project,
# and enable the Google + GitHub providers in Supabase Auth.
npm install
npm run dev                   # http://localhost:3001

# 2. Modal UI (in a new terminal)
cd kyuso-modal-ui
npm install
npm run dev                   # http://localhost:5173

# 3. Register a client, then update CLIENT_ID in kyuso-example-app/src/App.tsx
curl -X POST http://localhost:3001/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Example App", "redirect_uri": "http://localhost:5174/callback"}'

# 4. Example app (in a new terminal)
cd kyuso-example-app
npm install
npm run dev                   # http://localhost:5174
```

Required environment variables (see `kyuso-auth-server/.env.example`):

```
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, JWT_SECRET, PORT
```

## Project Structure

```
kyuso-oauth/
├── kyuso-auth-server/     # Fastify OAuth2 server (PKCE, Supabase, JWT)
│   ├── server.js          # App bootstrap + plugin/route registration
│   ├── routes/
│   │   ├── auth.js        # /authorize, /token, /userinfo
│   │   ├── login.js       # /login, /auth/google, /auth/github, /auth/callback
│   │   └── clients.js     # /clients registration & listing
│   ├── db/supabase.js     # Supabase client + table init
│   └── supabase-tables.sql
├── kyuso-modal-ui/        # React popup login modal (Vite)
│   └── src/
│       ├── components/    # LoginModal, PopupComplete
│       └── utils/oauth.ts # PKCE + popup helpers
└── kyuso-example-app/     # React demo client (Vite)
    └── src/App.tsx
```

## License

See repository for license information.

---

Built by [**nickthelegend**](https://github.com/nickthelegend) · [nickthelegend.tech](https://nickthelegend.tech)
