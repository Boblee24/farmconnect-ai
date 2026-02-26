async function farmersRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { status: 'farmers ready' };
  });
}

module.exports = farmersRoutes;