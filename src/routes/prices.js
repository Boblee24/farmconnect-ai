async function pricesRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { status: 'prices ready' };
  });
}

module.exports = pricesRoutes;