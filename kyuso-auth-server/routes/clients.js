import { supabaseAdmin } from '../db/supabase.js'
import crypto from 'crypto'

export async function clientRoutes(fastify) {
  // POST /clients - Register new OAuth client
  fastify.post('/clients', async (request, reply) => {
    const { name, redirect_uri } = request.body
    
    if (!name || !redirect_uri) {
      return reply.code(400).send({ error: 'name and redirect_uri required' })
    }

    const clientId = crypto.randomBytes(16).toString('hex')
    
    const { data, error } = await supabaseAdmin
      .from('oauth_clients')
      .insert({
        client_id: clientId,
        name,
        redirect_uri
      })
      .select()
      .single()

    if (error) {
      return reply.code(500).send({ error: error.message })
    }

    return reply.send({
      client_id: clientId,
      name,
      redirect_uri
    })
  })

  // GET /clients - List registered clients (for admin)
  fastify.get('/clients', async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('oauth_clients')
      .select('client_id, name, redirect_uri, created_at')

    if (error) {
      return reply.code(500).send({ error: error.message })
    }

    return reply.send(data)
  })
}