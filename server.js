if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Warm up HuggingFace model on startup
async function warmupNLP() {
  try {
    const { classifyIntent } = require('./src/services/nlp');
    await classifyIntent('hello');
    console.log('✅ NLP model warmed up');
  } catch (err) {
    console.log('⚠️ NLP warmup skipped:', err.message);
  }
}
const start = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    await warmupNLP(); // add this
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🌾 FarmConnect AI running on port ${PORT}`);
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
};

start();
