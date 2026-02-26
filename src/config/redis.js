const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  redis.on('connect', () => console.log('✅ Connected to Redis'));
  redis.on('error', (err) => console.error('❌ Redis error:', err));
} else {
  console.warn('⚠️  No REDIS_URL found, caching disabled');
  // Fallback mock so app doesn't crash without Redis
  redis = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
    incr: async () => 1,
    expire: async () => null
  };
}

module.exports = redis;
