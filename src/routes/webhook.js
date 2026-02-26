async function webhookRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { status: 'webhook ready' };
  });
}

module.exports = webhookRoutes;