const db = require('../config/db');

async function getSession(phone) {
  const result = await db.query(
    'SELECT * FROM sessions WHERE phone = $1',
    [phone]
  );
  return result.rows[0] || null;
}

async function setSession(phone, state, context = {}) {
  await db.query(
    `INSERT INTO sessions (phone, state, context, last_active)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (phone) DO UPDATE SET
       state = EXCLUDED.state,
       context = EXCLUDED.context,
       last_active = NOW()`,
    [phone, state, JSON.stringify(context)]
  );
}

async function clearSession(phone) {
  await db.query(
    `UPDATE sessions SET state = 'idle', context = '{}', last_active = NOW()
     WHERE phone = $1`,
    [phone]
  );
}

async function logConversation(phone, message, response, intent, entities) {
  // Get farmer id if exists
  const farmerResult = await db.query(
    'SELECT id FROM farmers WHERE phone = $1',
    [phone]
  );
  const farmerId = farmerResult.rows[0]?.id || null;

  await db.query(
    `INSERT INTO conversations (farmer_id, phone, message, response, intent, entities, direction)
     VALUES ($1, $2, $3, $4, $5, $6, 'inbound')`,
    [farmerId, phone, message, response, intent, JSON.stringify(entities)]
  );
}

module.exports = { getSession, setSession, clearSession, logConversation };