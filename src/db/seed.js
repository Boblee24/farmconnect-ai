require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await db.query(sql);
    console.log('✅ Crops seeded');
    console.log('✅ Markets seeded');
    console.log('✅ Prices seeded');
    console.log('✅ Buyers seeded');
    console.log('🎉 Database ready!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();