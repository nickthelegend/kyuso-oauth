import { supabase, supabaseAdmin } from '../db/supabase.js'
import { SignJWT } from 'jose'
import crypto from 'crypto'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function authRoutes(fastify) {
  // GET /authorize - OAuth2 authorization endpoint
  fastify.get('/authorize', async (request, reply) => {
    const { client_id, redirect_uri, response_type, code_challenge, state } = request.query
    
    if (response_type !== 'code') {
      return reply.code(400).send({ error: 'unsupported_response_type' })
    }

    // Verify client
    const { data: client } = await supabaseAdmin
      .from('oauth_clients')
      .select('*')
      .eq('client_id', client_id)
      .eq('redirect_uri', redirect_uri)
      .single()

    if (!client) {
      return reply.code(400).send({ error: 'invalid_client' })
    }

    // Check if user is authenticated via session
    const sessionToken = request.cookies.sb_session
    if (!sessionToken) {
      // Redirect to login page with OAuth params
      const loginUrl = `/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&code_challenge=${code_challenge}&state=${state}`
      return reply.redirect(loginUrl)
    }

    // Verify session with Supabase
    const { data: { user } } = await supabase.auth.getUser(sessionToken)
    if (!user) {
      const loginUrl = `/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&code_challenge=${code_challenge}&state=${state}`
      return reply.redirect(loginUrl)
    }

    // Generate authorization code
    const authCode = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await supabaseAdmin.from('oauth_auth_codes').insert({
      code: authCode,
      client_id,
      user_id: user.id,
      redirect_uri,
      code_challenge,
      expires_at: expiresAt.toISOString()
    })

    // Redirect back to client with code
    const redirectUrl = new URL(redirect_uri)
    redirectUrl.searchParams.set('code', authCode)
    if (state) redirectUrl.searchParams.set('state', state)
    
    return reply.redirect(redirectUrl.toString())
  })

  // POST /token - OAuth2 token endpoint
  fastify.post('/token', async (request, reply) => {
    const { grant_type, code, client_id, redirect_uri, code_verifier } = request.body

    if (grant_type !== 'authorization_code') {
      return reply.code(400).send({ error: 'unsupported_grant_type' })
    }

    // Verify and consume auth code
    const { data: authCodeData } = await supabaseAdmin
      .from('oauth_auth_codes')
      .select('*')
      .eq('code', code)
      .eq('client_id', client_id)
      .eq('redirect_uri', redirect_uri)
      .eq('used', false)
      .single()

    if (!authCodeData || new Date() > new Date(authCodeData.expires_at)) {
      return reply.code(400).send({ error: 'invalid_grant' })
    }

    // Verify PKCE if present
    if (authCodeData.code_challenge && code_verifier) {
      const hash = crypto.createHash('sha256').update(code_verifier).digest('base64url')
      if (hash !== authCodeData.code_challenge) {
        return reply.code(400).send({ error: 'invalid_grant' })
      }
    }

    // Mark code as used
    await supabaseAdmin
      .from('oauth_auth_codes')
      .update({ used: true })
      .eq('code', code)

    // Get user data
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(authCodeData.user_id)

    // Generate tokens
    const accessToken = await new SignJWT({ 
      sub: user.id, 
      email: user.email,
      client_id 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(JWT_SECRET)

    const refreshToken = crypto.randomBytes(32).toString('hex')
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await supabaseAdmin.from('oauth_refresh_tokens').insert({
      token: refreshToken,
      user_id: user.id,
      client_id,
      expires_at: refreshExpiresAt.toISOString()
    })

    return reply.send({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken
    })
  })

  // GET /userinfo - OAuth2 userinfo endpoint
  fastify.get('/userinfo', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'invalid_token' })
    }

    try {
      const token = authHeader.slice(7)
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(payload.sub)
      
      return reply.send({
        sub: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      })
    } catch (error) {
      return reply.code(401).send({ error: 'invalid_token' })
    }
  })
}