import { supabase } from '../db/supabase.js'

export async function loginRoutes(fastify) {
  // GET /login - Show login page
  fastify.get('/login', async (request, reply) => {
    const { client_id, redirect_uri, code_challenge, state } = request.query
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>kyuso Auth - Login</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
        .login-btn { display: block; width: 100%; padding: 12px; margin: 10px 0; text-decoration: none; 
                     background: #333; color: white; text-align: center; border-radius: 5px; }
        .google { background: #db4437; }
        .github { background: #333; }
      </style>
    </head>
    <body>
      <h2>Login to kyuso Auth</h2>
      <p>Choose your login method:</p>
      
      <a href="/auth/google?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&code_challenge=${code_challenge}&state=${state}" 
         class="login-btn google">Login with Google</a>
      
      <a href="/auth/github?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&code_challenge=${code_challenge}&state=${state}" 
         class="login-btn github">Login with GitHub</a>
    </body>
    </html>`
    
    return reply.type('text/html').send(html)
  })

  // GET /auth/google - Initiate Google OAuth
  fastify.get('/auth/google', async (request, reply) => {
    const { client_id, redirect_uri, code_challenge, state } = request.query
    
    // Store OAuth params in session for later
    request.session.oauthParams = { client_id, redirect_uri, code_challenge, state }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${request.protocol}://${request.hostname}:${process.env.PORT}/auth/callback`
      }
    })
    
    if (error) {
      return reply.code(500).send({ error: error.message })
    }
    
    return reply.redirect(data.url)
  })

  // GET /auth/github - Initiate GitHub OAuth  
  fastify.get('/auth/github', async (request, reply) => {
    const { client_id, redirect_uri, code_challenge, state } = request.query
    
    request.session.oauthParams = { client_id, redirect_uri, code_challenge, state }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${request.protocol}://${request.hostname}:${process.env.PORT}/auth/callback`
      }
    })
    
    if (error) {
      return reply.code(500).send({ error: error.message })
    }
    
    return reply.redirect(data.url)
  })

  // GET /auth/callback - Handle OAuth callback
  fastify.get('/auth/callback', async (request, reply) => {
    const { access_token, refresh_token } = request.query
    const oauthParams = request.session.oauthParams
    
    if (!access_token || !oauthParams) {
      return reply.code(400).send({ error: 'Invalid callback' })
    }

    // Set session cookie
    reply.setCookie('sb_session', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    })

    // Redirect back to authorize endpoint
    const authorizeUrl = `/authorize?client_id=${oauthParams.client_id}&redirect_uri=${encodeURIComponent(oauthParams.redirect_uri)}&response_type=code&code_challenge=${oauthParams.code_challenge}&state=${oauthParams.state}`
    
    return reply.redirect(authorizeUrl)
  })
}