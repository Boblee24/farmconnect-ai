if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🌾 FarmConnect AI running on port ${PORT}`);
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
};

start();
