const fastify = require('fastify')({ logger: true });
const path = require('path');

// Plugins
fastify.register(require('@fastify/cors'), { origin: '*' });
fastify.register(require('@fastify/formbody'));

// Routes
fastify.register(require('./routes/webhook'), { prefix: '/webhook' });
fastify.register(require('./routes/prices'), { prefix: '/api/prices' });
fastify.register(require('./routes/farmers'), { prefix: '/api/farmers' });
fastify.register(require('./routes/buyers'), { prefix: '/api/buyers' });
fastify.register(require('./routes/admin'), { prefix: '/api/admin' });


fastify.get('/admin', async (request, reply) => {
  const key = request.query.key;
  if (key !== (process.env.ADMIN_KEY || 'farmconnect-admin-2026')) {
    return reply.code(401).send(`
      <html><body style="background:#0d0f0a;color:#7bc67a;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column">
        <h2>🌾 FarmConnect Admin</h2>
        <p>Access denied. Add ?key=yourpassword to the URL</p>
      </body></html>
    `);
  }
  return reply.sendFile('index.html', path.join(__dirname, '../admin'));
});

// Register admin API routes
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../admin'),
  prefix: '/admin-static/',
});

// Health check
fastify.get('/', async (request, reply) => {
  return { status: 'ok', message: '🌾 FarmConnect AI is running' };
});

module.exports = fastify;