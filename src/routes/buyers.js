async function buyersRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { status: 'buyers ready' };
  });
}

module.exports = buyersRoutes;