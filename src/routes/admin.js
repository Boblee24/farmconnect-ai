async function adminRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { status: 'admin ready' };
  });
}

module.exports = adminRoutes;