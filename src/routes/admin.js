const db = require('../config/db');

async function adminRoutes(fastify, options) {

  // Get all crops
  fastify.get('/crops', async (request, reply) => {
    const result = await db.query('SELECT * FROM crops ORDER BY name');
    return result.rows;
  });

  // Get all markets
  fastify.get('/markets', async (request, reply) => {
    const result = await db.query('SELECT * FROM markets ORDER BY country, state, name');
    return result.rows;
  });

  // Get all prices with crop and market names
  fastify.get('/prices', async (request, reply) => {
    const result = await db.query(`
      SELECT 
        p.id,
        p.price_per_unit,
        p.unit,
        p.trend,
        p.recorded_at,
        p.source,
        c.name AS crop_name,
        m.name AS market_name,
        m.state,
        m.country
      FROM prices p
      JOIN crops c ON c.id = p.crop_id
      JOIN markets m ON m.id = p.market_id
      ORDER BY p.recorded_at DESC
    `);
    return result.rows;
  });

  // Update a price
  fastify.put('/prices/:id', async (request, reply) => {
    const { id } = request.params;
    const { price_per_unit, trend } = request.body;

    const result = await db.query(
      `UPDATE prices 
       SET price_per_unit = $1, trend = $2, recorded_at = NOW()
       WHERE id = $3 RETURNING *`,
      [price_per_unit, trend, id]
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Price not found' });
    }

    return result.rows[0];
  });

  // Add a new price entry
  fastify.post('/prices', async (request, reply) => {
    const { crop_id, market_id, price_per_unit, unit, trend } = request.body;

    const result = await db.query(
      `INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
       VALUES ($1, $2, $3, $4, $5, 'admin')
       RETURNING *`,
      [crop_id, market_id, price_per_unit, unit || 'kg', trend || 'stable']
    );

    return reply.code(201).send(result.rows[0]);
  });

  // Get dashboard stats
  fastify.get('/stats', async (request, reply) => {
    const [farmers, conversations, prices, buyers] = await Promise.all([
      db.query('SELECT COUNT(*) FROM farmers'),
      db.query('SELECT COUNT(*) FROM conversations WHERE created_at >= NOW() - INTERVAL \'24 hours\''),
      db.query('SELECT COUNT(*) FROM prices'),
      db.query('SELECT COUNT(*) FROM buyers WHERE is_verified = true')
    ]);

    return {
      total_farmers: parseInt(farmers.rows[0].count),
      messages_today: parseInt(conversations.rows[0].count),
      total_prices: parseInt(prices.rows[0].count),
      verified_buyers: parseInt(buyers.rows[0].count)
    };
  });

  // Get all farmers
  fastify.get('/farmers', async (request, reply) => {
    const result = await db.query(
      `SELECT id, phone, name, location, state, country, language, 
              crops, is_subscribed, query_count, created_at 
       FROM farmers ORDER BY created_at DESC`
    );
    return result.rows;
  });

  // Get all buyers
  fastify.get('/buyers', async (request, reply) => {
    const result = await db.query('SELECT * FROM buyers ORDER BY created_at DESC');
    return result.rows;
  });

  // Add a new buyer
  fastify.post('/buyers', async (request, reply) => {
    const { name, phone, company, buyer_type, crops, states, countries, min_quantity, max_quantity, unit } = request.body;

    const result = await db.query(
      `INSERT INTO buyers (name, phone, company, buyer_type, crops, states, countries, min_quantity, max_quantity, unit, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING *`,
      [name, phone, company, buyer_type, crops, states, countries, min_quantity, max_quantity, unit || 'kg']
    );

    return reply.code(201).send(result.rows[0]);
  });
}

module.exports = adminRoutes;