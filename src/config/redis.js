// Fallback mock — no Redis connection needed for MVP
const redis = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
  incr: async () => 1,
  expire: async () => null
};

console.log('⚠️  Redis disabled — running without cache');

module.exports = redis;