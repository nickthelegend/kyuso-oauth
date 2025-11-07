import Fastify from 'fastify'
import cors from '@fastify/cors'
import session from '@fastify/session'
import cookie from '@fastify/cookie'
import { authRoutes } from './routes/auth.js'
import { loginRoutes } from './routes/login.js'
import { clientRoutes } from './routes/clients.js'
import { initTables } from './db/supabase.js'

const fastify = Fastify({ logger: true })

// Register plugins
await fastify.register(cors, {
  origin: true,
  credentials: true
})

await fastify.register(cookie)
await fastify.register(session, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  cookie: { secure: false } // Set to true in production with HTTPS
})

// Register routes
await fastify.register(authRoutes)
await fastify.register(loginRoutes)
await fastify.register(clientRoutes)

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'kyuso-auth-server' }
})

// Initialize database tables
try {
  await initTables()
  console.log('Database tables initialized')
} catch (error) {
  console.log('Database tables may need to be created manually:', error.message)
}

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`kyuso Auth Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()