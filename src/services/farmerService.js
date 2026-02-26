const db = require('../config/db');

async function getFarmerByPhone(phone) {
  const result = await db.query(
    'SELECT * FROM farmers WHERE phone = $1',
    [phone]
  );
  return result.rows[0] || null;
}

async function createFarmer(phone, data = {}) {
  const result = await db.query(
    `INSERT INTO farmers (phone, name, location, state, country, language, crops)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (phone) DO UPDATE SET
       name = EXCLUDED.name,
       updated_at = NOW()
     RETURNING *`,
    [
      phone,
      data.name || null,
      data.location || null,
      data.state || null,
      data.country || 'Nigeria',
      data.language || 'en',
      data.crops || []
    ]
  );
  return result.rows[0];
}

async function updateFarmer(phone, data) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');

  const result = await db.query(
    `UPDATE farmers SET ${setClause}, updated_at = NOW() WHERE phone = $1 RETURNING *`,
    [phone, ...values]
  );
  return result.rows[0];
}

async function checkQueryLimit(phone) {
  const farmer = await getFarmerByPhone(phone);
  if (!farmer) return { allowed: true, remaining: 3 };

  // Subscribers have unlimited access
  if (farmer.is_subscribed && farmer.subscription_expires_at > new Date()) {
    return { allowed: true, remaining: 999, subscribed: true };
  }

  // Reset count if it's a new day
  const lastReset = new Date(farmer.query_reset_at);
  const now = new Date();
  const isNewDay = now.toDateString() !== lastReset.toDateString();

  if (isNewDay) {
    await db.query(
      'UPDATE farmers SET query_count = 0, query_reset_at = NOW() WHERE phone = $1',
      [phone]
    );
    return { allowed: true, remaining: 3 };
  }

  const limit = parseInt(process.env.FREE_QUERY_LIMIT) || 3;
  const remaining = limit - farmer.query_count;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    subscribed: false
  };
}

async function incrementQueryCount(phone) {
  await db.query(
    'UPDATE farmers SET query_count = query_count + 1 WHERE phone = $1',
    [phone]
  );
}

module.exports = {
  getFarmerByPhone,
  createFarmer,
  updateFarmer,
  checkQueryLimit,
  incrementQueryCount
};