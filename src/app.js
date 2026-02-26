const fastify = require('fastify')({ logger: true });

// Plugins
fastify.register(require('@fastify/cors'), { origin: '*' });
fastify.register(require('@fastify/formbody'));

// Routes
fastify.register(require('./routes/webhook'), { prefix: '/webhook' });
fastify.register(require('./routes/prices'), { prefix: '/api/prices' });
fastify.register(require('./routes/farmers'), { prefix: '/api/farmers' });
fastify.register(require('./routes/buyers'), { prefix: '/api/buyers' });
fastify.register(require('./routes/admin'), { prefix: '/api/admin' });

// Health check
fastify.get('/', async (request, reply) => {
  return { status: 'ok', message: '🌾 FarmConnect AI is running' };
});

module.exports = fastify;