const db = require('../config/db');
const { syncPricesFromHDX } = require('../services/priceSync');

// Simple admin key protection
const ADMIN_KEY = process.env.ADMIN_KEY || 'farmconnect-admin-2026';

async function adminRoutes(fastify, options) {

  // ─── AUTH HOOK ─────────────────────────────────────────────────────────
fastify.addHook('preHandler', async (request, reply) => {
  const key = request.headers['x-admin-key'] || request.query.key;
  const ADMIN_KEY = process.env.ADMIN_KEY || 'farmconnect-admin-2026';
  
  if (key !== ADMIN_KEY) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

  // ─── STATS ─────────────────────────────────────────────────────────────
  fastify.get('/stats', async (request, reply) => {
    const [farmers, conversations, prices, buyers] = await Promise.all([
      db.query('SELECT COUNT(*) FROM farmers'),
      db.query("SELECT COUNT(*) FROM conversations WHERE created_at >= NOW() - INTERVAL '24 hours'"),
      db.query('SELECT COUNT(*) FROM prices'),
      db.query('SELECT COUNT(*) FROM buyers WHERE is_verified = true'),
    ]);

    return {
      farmers: parseInt(farmers.rows[0].count),
      messagesToday: parseInt(conversations.rows[0].count),
      prices: parseInt(prices.rows[0].count),
      buyers: parseInt(buyers.rows[0].count),
    };
  });

  // ─── CROPS ─────────────────────────────────────────────────────────────
  fastify.get('/crops', async (request, reply) => {
    const result = await db.query('SELECT * FROM crops ORDER BY name');
    return { crops: result.rows };
  });

  // ─── MARKETS ───────────────────────────────────────────────────────────
  fastify.get('/markets', async (request, reply) => {
    const result = await db.query('SELECT * FROM markets ORDER BY country, state, name');
    return { markets: result.rows };
  });

  // ─── PRICES ────────────────────────────────────────────────────────────
  fastify.get('/prices', async (request, reply) => {
    const limit = parseInt(request.query.limit) || 500;
    const offset = parseInt(request.query.offset) || 0;

    const result = await db.query(`
      SELECT 
        p.id,
        p.price_per_unit,
        p.unit,
        p.trend,
        p.source,
        p.updated_at,
        p.recorded_at,
        p.crop_id,
        p.market_id,
        c.name AS crop_name,
        m.name AS market_name,
        m.state,
        m.country
      FROM prices p
      JOIN crops c ON c.id = p.crop_id
      JOIN markets m ON m.id = p.market_id
      ORDER BY p.updated_at DESC NULLS LAST, p.recorded_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const total = await db.query('SELECT COUNT(*) FROM prices');

    return {
      prices: result.rows,
      total: parseInt(total.rows[0].count),
    };
  });

  // Update a price
  fastify.put('/prices/:id', async (request, reply) => {
    const { id } = request.params;
    const { price_per_unit, trend, source } = request.body;

    const result = await db.query(
      `UPDATE prices 
       SET price_per_unit = $1, trend = $2, source = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [price_per_unit, trend || 'stable', source || 'manual', id]
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Price not found' });
    }

    return { price: result.rows[0] };
  });

  // Add a new price
  fastify.post('/prices', async (request, reply) => {
    const { crop_name, market_id, price_per_unit, unit, trend, source } = request.body;

    // Look up crop_id from name
    const cropResult = await db.query(
      'SELECT id FROM crops WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [crop_name]
    );

    if (!cropResult.rows.length) {
      return reply.code(400).send({ error: `Crop "${crop_name}" not found` });
    }

    const crop_id = cropResult.rows[0].id;

    const result = await db.query(
      `INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (crop_id, market_id)
       DO UPDATE SET
         price_per_unit = EXCLUDED.price_per_unit,
         trend = EXCLUDED.trend,
         source = EXCLUDED.source,
         updated_at = NOW()
       RETURNING *`,
      [crop_id, market_id, price_per_unit, unit || 'kg', trend || 'stable', source || 'manual']
    );

    return reply.code(201).send({ price: result.rows[0] });
  });

  // ─── BUYERS ────────────────────────────────────────────────────────────
  fastify.get('/buyers', async (request, reply) => {
    const result = await db.query(`
      SELECT * FROM buyers ORDER BY is_verified DESC, created_at DESC
    `);
    return { buyers: result.rows };
  });

  fastify.post('/buyers', async (request, reply) => {
    const {
      name, phone, company, buyer_type,
      crops, states, countries,
      min_quantity_kg, max_quantity_kg,
    } = request.body;

    const result = await db.query(
      `INSERT INTO buyers 
        (name, phone, company, buyer_type, crops, states, countries, 
         min_quantity_kg, max_quantity_kg, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW())
       RETURNING *`,
      [
        name, phone, company || name, buyer_type || 'aggregator',
        crops || [], states || [], countries || ['Nigeria'],
        min_quantity_kg || 0, max_quantity_kg || 0,
      ]
    );

    return reply.code(201).send({ buyer: result.rows[0] });
  });

  fastify.put('/buyers/:id', async (request, reply) => {
    const { id } = request.params;
    const { is_verified, name, phone, buyer_type, crops, states } = request.body;

    const result = await db.query(
      `UPDATE buyers SET
        is_verified = COALESCE($1, is_verified),
        name = COALESCE($2, name),
        phone = COALESCE($3, phone),
        buyer_type = COALESCE($4, buyer_type),
        crops = COALESCE($5, crops),
        states = COALESCE($6, states)
       WHERE id = $7 RETURNING *`,
      [is_verified, name, phone, buyer_type, crops, states, id]
    );

    if (!result.rows.length) {
      return reply.code(404).send({ error: 'Buyer not found' });
    }

    return { buyer: result.rows[0] };
  });

  // ─── FARMERS ───────────────────────────────────────────────────────────
  fastify.get('/farmers', async (request, reply) => {
    const limit = parseInt(request.query.limit) || 500;

    const result = await db.query(
      `SELECT id, phone, name, location, state, country, language,
              crops, is_subscribed, query_count, created_at
       FROM farmers
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return { farmers: result.rows };
  });

  // ─── CONVERSATIONS ─────────────────────────────────────────────────────
  fastify.get('/conversations', async (request, reply) => {
    const limit = parseInt(request.query.limit) || 200;
    const offset = parseInt(request.query.offset) || 0;

    const result = await db.query(
      `SELECT id, phone, message, response, intent, direction, created_at
       FROM conversations
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = await db.query('SELECT COUNT(*) FROM conversations');

    return {
      conversations: result.rows,
      total: parseInt(total.rows[0].count),
    };
  });

  // ─── SYNC PRICES ───────────────────────────────────────────────────────
  fastify.post('/sync-prices', async (request, reply) => {
    // Run in background, don't await
    syncPricesFromHDX().then(result => {
      console.log('✅ Manual sync complete:', result);
    }).catch(err => {
      console.error('❌ Manual sync failed:', err.message);
    });

    return { message: 'Price sync started in background' };
  });

}

module.exports = adminRoutes;