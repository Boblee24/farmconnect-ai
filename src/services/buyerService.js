const db = require('../config/db');

async function findBuyersForCrop(cropName, country = null) {
  let query = `
    SELECT * FROM buyers
    WHERE $1 = ANY(crops)
    AND is_verified = true
  `;
  const params = [cropName];

  if (country) {
    query += ` AND $2 = ANY(countries)`;
    params.push(country);
  }

  query += ` ORDER BY rating DESC LIMIT 5`;

  const result = await db.query(query, params);
  return result.rows;
}

function formatBuyerResponse(buyers, cropName) {
  if (!buyers || buyers.length === 0) return null;

  let message = `🛒 *Buyers for ${cropName}:*\n\n`;

  buyers.forEach((b, i) => {
    message += `${i + 1}. *${b.name}*\n`;
    message += `   📦 Type: ${b.buyer_type}\n`;
    message += `   📍 Location: ${b.states.join(', ')}\n`;
    message += `   📊 Min: ${b.min_quantity}${b.unit} | Max: ${b.max_quantity}${b.unit}\n`;
    message += `   ⭐ Rating: ${b.rating}/5\n`;
    message += `   📞 Contact: ${b.phone}\n\n`;
  });

  message += `_Reply with the buyer number to get more details._`;
  return message;
}

module.exports = { findBuyersForCrop, formatBuyerResponse };