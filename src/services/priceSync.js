const axios = require('axios');
require("dotenv").config();
const db = require('../config/db');

const HDX_API = 'https://hapi.humdata.org/api/v1/food/food-price';

// Maps HDX country codes to your DB country names
const COUNTRY_MAP = {
    'NGA': 'Nigeria',
    'GHA': 'Ghana',
    'KEN': 'Kenya',
};

// Maps HDX commodity names to your DB crop names
const CROP_MAP = {
    // Maize variants
    'Maize': 'Maize',
    'Maize (white)': 'Maize',
    'Maize (yellow)': 'Maize',
    'Maize (white, dry)': 'Maize',
    'Maize flour (white)': 'Maize',
    'Maize flour': 'Maize',

    // Rice variants
    'Rice': 'Rice',
    'Rice (milled)': 'Rice',
    'Rice (imported)': 'Rice',
    'Rice (local)': 'Rice',
    'Rice (paddy)': 'Rice',
    'Rice (aromatic)': 'Rice',

    // Cassava variants
    'Cassava': 'Cassava',
    'Cassava (fresh)': 'Cassava',
    'Cassava (processed)': 'Cassava',
    'Cassava meal (gari, yellow)': 'Cassava',
    'Gari (white)': 'Cassava',

    // Tomato
    'Tomatoes': 'Tomato',
    'Tomato': 'Tomato',

    // Onion
    'Onions': 'Onion',
    'Onion': 'Onion',
    'Onion (red)': 'Onion',

    // Sorghum
    'Sorghum': 'Sorghum',
    'Sorghum (red)': 'Sorghum',
    'Sorghum (white)': 'Sorghum',
    'Sorghum (brown)': 'Sorghum',

    // Cowpea
    'Cowpeas': 'Cowpea',
    'Cowpea': 'Cowpea',
    'Cowpeas (white)': 'Cowpea',
    'Cowpeas (brown)': 'Cowpea',
    'Cowpeas (dry)': 'Cowpea',

    // Groundnut
    'Groundnuts': 'Groundnut',
    'Groundnut': 'Groundnut',
    'Groundnuts (shelled)': 'Groundnut',

    // Plantain
    'Plantain': 'Plantain',
    'Plantains': 'Plantain',
    'Plantains (apentu)': 'Plantain',

    // Yam
    'Yam': 'Yam',
    'Yams': 'Yam',
};

// Determine trend based on price change percentage
function calculateTrend(currentPrice, previousPrice) {
    if (!previousPrice) return 'stable';
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    if (change > 3) return 'rising';
    if (change < -3) return 'falling';
    return 'stable';
}

// Fetch prices from HDX HAPI for a specific country
async function fetchPricesFromHDX(countryCode) {
    try {
        const rawEmail = process.env.HDX_EMAIL || "ayomiposiaborisade6@gmail.com";
        const appIdentifier =
            process.env.HDX_APP_IDENTIFIER?.trim() ||
            Buffer.from(`FarmConnectAI:${rawEmail}`).toString("base64");

        // Only fetch last 6 months of data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const fromDate = sixMonthsAgo.toISOString().split('T')[0];

        const response = await axios.get(HDX_API, {
            headers: {
                "X-HDX-HAPI-APP-IDENTIFIER": appIdentifier,
            },
            params: {
                location_code: countryCode,
                output_format: 'json',
                limit: 1000,
                price_flag: 'actual',
                reference_period_start_min: '2024-01-01', // 👈 2024 and newer only
            },
            timeout: 20000, // 👈 increased for Kenya
        });

        return response.data?.data || [];
    } catch (err) {
        console.error(`❌ HDX fetch failed for ${countryCode}:`, err.response?.status, err.response?.data || err.message);
        return [];
    }
}
function getLatestPrices(records) {
    const latest = {};
    for (const record of records) {
        const key = `${record.commodity_name}__${record.market_name}`;
        const existingDate = latest[key]?.reference_period_start || '';
        if (!latest[key] || record.reference_period_start > existingDate) {
            latest[key] = record;
        }
    }
    return Object.values(latest);
}

// Get or create a market in your DB
async function getOrCreateMarket(marketName, admin1, countryName) {
    // Try to find existing market
    const existing = await db.query(
        `SELECT id FROM markets 
     WHERE LOWER(name) LIKE LOWER($1) AND country = $2
     LIMIT 1`,
        [`%${marketName}%`, countryName]
    );

    if (existing.rows.length > 0) return existing.rows[0].id;

    // Create new market if it doesn't exist
    const created = await db.query(
        `INSERT INTO markets (name, state, country, region)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING
     RETURNING id`,
        [
            marketName,
            admin1 || countryName,
            countryName,
            countryName === 'Kenya' ? 'East Africa' : 'West Africa',
        ]
    );

    return created.rows[0]?.id || null;
}

// Get crop ID from your DB
async function getCropId(cropName) {
    const result = await db.query(
        `SELECT id FROM crops WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [cropName]
    );
    return result.rows[0]?.id || null;
}

// Get previous price to calculate trend
async function getPreviousPrice(cropId, marketId) {
    const result = await db.query(
        `SELECT price_per_unit FROM prices 
     WHERE crop_id = $1 AND market_id = $2 
     ORDER BY updated_at DESC 
     LIMIT 1`,
        [cropId, marketId]
    );
    return result.rows[0]?.price_per_unit || null;
}

// Main sync function
async function syncPricesFromHDX() {
    console.log('🔄 Starting price sync from HDX HAPI...');
    let totalUpdated = 0;
    let totalCreated = 0;
    let totalSkipped = 0;

    for (const [countryCode, countryName] of Object.entries(COUNTRY_MAP)) {
        console.log(`📡 Fetching prices for ${countryName}...`);

        const records = await fetchPricesFromHDX(countryCode);
        const latestRecords = getLatestPrices(records);
        console.log(`   Found ${records.length} records`);

        for (const record of latestRecords) {
            try {
                // Map HDX commodity name to your crop name
                const cropName = CROP_MAP[record.commodity_name];
                if (!cropName) {
                    // console.log(`   Skipping unknown crop: "${record.commodity_name}"`);
                    totalSkipped++;
                    continue;
                }

                // Skip if no price
                if (!record.price || record.price <= 0) {
                    totalSkipped++;
                    continue;
                }

                // Get crop ID
                const cropId = await getCropId(cropName);
                if (!cropId) {
                    totalSkipped++;
                    continue;
                }

                // Get or create market
                const marketId = await getOrCreateMarket(
                    record.market_name,
                    record.admin1_name,
                    countryName
                );
                if (!marketId) {
                    totalSkipped++;
                    continue;
                }

                // Get previous price for trend calculation
                const previousPrice = await getPreviousPrice(cropId, marketId);
                const trend = calculateTrend(record.price, previousPrice);

                // Convert price to per kg (HDX uses different units)
                let pricePerKg = record.price;
                const unit = (record.unit || 'KG').toUpperCase();
                if (unit.includes('100KG') || unit.includes('100 KG')) {
                    pricePerKg = record.price / 100;
                } else if (unit.includes('50KG') || unit.includes('50 KG')) {
                    pricePerKg = record.price / 50;
                } else if (unit.includes('90KG') || unit.includes('90 KG')) {
                    pricePerKg = record.price / 90;
                }

                // Upsert price into your DB
                const result = await db.query(
                    `INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source, updated_at)
           VALUES ($1, $2, $3, 'kg', $4, 'hdx_wfp', NOW())
           ON CONFLICT (crop_id, market_id)
           DO UPDATE SET 
             price_per_unit = EXCLUDED.price_per_unit,
             trend = EXCLUDED.trend,
             source = EXCLUDED.source,
             updated_at = NOW()
           RETURNING (xmax = 0) AS inserted`,
                    [cropId, marketId, Math.round(pricePerKg), trend]
                );

                if (result.rows[0]?.inserted) {
                    totalCreated++;
                } else {
                    totalUpdated++;
                }

            } catch (err) {
                console.error(`   ⚠️ Error processing record:`, err.message);
                totalSkipped++;
            }
        }
    }

    console.log(`✅ Price sync complete:`);
    console.log(`   Created: ${totalCreated}`);
    console.log(`   Updated: ${totalUpdated}`);
    console.log(`   Skipped: ${totalSkipped}`);

    return { totalCreated, totalUpdated, totalSkipped };
}

module.exports = { syncPricesFromHDX };