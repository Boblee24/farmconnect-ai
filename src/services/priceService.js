const db = require('../config/db');
const redis = require('../config/redis');

async function getPriceForCropAndMarket(cropName, marketName) {
  const cacheKey = `price:${cropName}:${marketName}`.toLowerCase().replace(/\s+/g, '_');

  // Check cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('💨 Cache hit:', cacheKey);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('⚠️ Cache read failed:', err.message);
  }

  // Query database
  const result = await db.query(
    `SELECT 
      p.price_per_unit,
      p.unit,
      p.trend,
      p.recorded_at,
      c.name AS crop_name,
      m.name AS market_name,
      m.state,
      m.country
    FROM prices p
    JOIN crops c ON c.id = p.crop_id
    JOIN markets m ON m.id = p.market_id
    WHERE LOWER(c.name) = LOWER($1)
      AND LOWER(m.name) = LOWER($2)
    ORDER BY p.recorded_at DESC
    LIMIT 1`,
    [cropName, marketName]
  );

  if (result.rows.length === 0) return null;

  const data = result.rows[0];

  // Cache for 30 minutes
  try {
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 1800);
  } catch (err) {
    console.warn('⚠️ Cache write failed:', err.message);
  }

  return data;
}

async function getPricesForCrop(cropName) {
  const cacheKey = `prices:${cropName}`.toLowerCase().replace(/\s+/g, '_');

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.warn('⚠️ Cache read failed:', err.message);
  }

  const result = await db.query(
    `SELECT 
      p.price_per_unit,
      p.unit,
      p.trend,
      p.recorded_at,
      c.name AS crop_name,
      m.name AS market_name,
      m.state,
      m.country
    FROM prices p
    JOIN crops c ON c.id = p.crop_id
    JOIN markets m ON m.id = p.market_id
    WHERE LOWER(c.name) = LOWER($1)
    ORDER BY p.price_per_unit ASC`,
    [cropName]
  );

  if (result.rows.length === 0) return null;

  try {
    await redis.set(cacheKey, JSON.stringify(result.rows), 'EX', 1800);
  } catch (err) {
    console.warn('⚠️ Cache write failed:', err.message);
  }

  return result.rows;
}

async function getAllPricesForCropFormatted(cropName) {
  const prices = await getPricesForCrop(cropName);
  if (!prices || prices.length === 0) return null;

  const trendEmoji = { up: '📈', down: '📉', stable: '➡️' };

  let message = `💰 *${cropName} Prices Across Markets:*\n\n`;

  prices.forEach(p => {
    const emoji = trendEmoji[p.trend] || '➡️';
    message += `📍 ${p.market_name}, ${p.state}\n`;
    message += `   ₦${parseFloat(p.price_per_unit).toLocaleString()} per ${p.unit} ${emoji}\n\n`;
  });

  message += `_Updated: ${new Date().toLocaleDateString('en-NG')}_`;
  return message;
}

function formatPriceResponse(priceData) {
  const trendEmoji = { up: '📈', down: '📉', stable: '➡️' };
  const trendText = { up: 'Rising', down: 'Falling', stable: 'Stable' };
  const emoji = trendEmoji[priceData.trend] || '➡️';
  const trend = trendText[priceData.trend] || 'Stable';

  return `💰 *${priceData.crop_name} Price*\n\n` +
    `📍 Market: ${priceData.market_name}, ${priceData.state}\n` +
    `💵 Price: ₦${parseFloat(priceData.price_per_unit).toLocaleString()} per ${priceData.unit}\n` +
    `${emoji} Trend: ${trend}\n\n` +
    `_Last updated: ${new Date(priceData.recorded_at).toLocaleDateString('en-NG')}_\n\n` +
    `Type *"all ${priceData.crop_name} prices"* to see other markets.`;
}

async function getRecentPriceHistory(cropName, marketName, days = 7) {
  const result = await db.query(
    `SELECT 
      p.price_per_unit,
      p.trend,
      p.recorded_at
    FROM prices p
    JOIN crops c ON c.id = p.crop_id
    JOIN markets m ON m.id = p.market_id
    WHERE LOWER(c.name) = LOWER($1)
      AND LOWER(m.name) = LOWER($2)
      AND p.recorded_at >= NOW() - INTERVAL '${days} days'
    ORDER BY p.recorded_at ASC`,
    [cropName, marketName]
  );

  return result.rows;
}

module.exports = {
  getPriceForCropAndMarket,
  getPricesForCrop,
  getAllPricesForCropFormatted,
  formatPriceResponse,
  getRecentPriceHistory
};