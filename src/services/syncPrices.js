const { syncPricesFromHDX } = require('../services/priceSync');

// Run sync immediately, then every 24 hours
async function startPriceSyncJob() {
  console.log('⏰ Price sync job started');

  // Run immediately on startup
  await runSync();

  // Then run every 24 hours
  setInterval(async () => {
    await runSync();
  }, 24 * 60 * 60 * 1000);
}

async function runSync() {
  try {
    console.log(`\n⏰ [${new Date().toISOString()}] Running scheduled price sync...`);
    await syncPricesFromHDX();
  } catch (err) {
    console.error('❌ Price sync job failed:', err.message);
  }
}

module.exports = { startPriceSyncJob };