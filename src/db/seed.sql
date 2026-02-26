-- =====================
-- CROPS (10 major crops)
-- =====================
INSERT INTO crops (name, local_names, category, unit) VALUES
('Maize', '{"ha": "Masara", "yo": "Agbado", "ig": "Oka"}', 'grain', 'kg'),
('Rice', '{"ha": "Shinkafa", "yo": "Iresi", "ig": "Osikapa"}', 'grain', 'kg'),
('Yam', '{"ha": "Doya", "yo": "Isu", "ig": "Ji"}', 'tuber', 'kg'),
('Cassava', '{"ha": "Rogo", "yo": "Ege", "ig": "Akpu"}', 'tuber', 'kg'),
('Tomato', '{"ha": "Tumatir", "yo": "Tomati", "ig": "Tomato"}', 'vegetable', 'kg'),
('Onion', '{"ha": "Albasa", "yo": "Alubosa", "ig": "Yabasị"}', 'vegetable', 'kg'),
('Sorghum', '{"ha": "Dawa", "yo": "Oka Baba", "ig": "Oka Oji"}', 'grain', 'kg'),
('Cowpea', '{"ha": "Wake", "yo": "Ewa", "ig": "Akidi"}', 'legume', 'kg'),
('Groundnut', '{"ha": "Gyada", "yo": "Epa", "ig": "Ahụekere"}', 'legume', 'kg'),
('Plantain', '{"ha": "Ayaba", "yo": "Ogede", "ig": "Ojoko"}', 'fruit', 'kg')
ON CONFLICT DO NOTHING;

-- =====================
-- MARKETS (20 markets across Nigeria + Ghana + Kenya)
-- =====================
INSERT INTO markets (name, state, country, region) VALUES
('Mile 12 Market', 'Lagos', 'Nigeria', 'South West'),
('Bodija Market', 'Oyo', 'Nigeria', 'South West'),
('Kano Central Market', 'Kano', 'Nigeria', 'North West'),
('Wudil Market', 'Kano', 'Nigeria', 'North West'),
('Kasuwan Barchi', 'Sokoto', 'Nigeria', 'North West'),
('Dawanau Market', 'Kano', 'Nigeria', 'North West'),
('Galadima Market', 'Abuja', 'Nigeria', 'North Central'),
('Nyanya Market', 'Abuja', 'Nigeria', 'North Central'),
('Onitsha Main Market', 'Anambra', 'Nigeria', 'South East'),
('Eke Awka Market', 'Anambra', 'Nigeria', 'South East'),
('Aba Market', 'Abia', 'Nigeria', 'South East'),
('Ogbete Market', 'Enugu', 'Nigeria', 'South East'),
('Creek Road Market', 'Rivers', 'Nigeria', 'South South'),
('Rumuola Market', 'Rivers', 'Nigeria', 'South South'),
('Owode Market', 'Ogun', 'Nigeria', 'South West'),
('Sabo Market', 'Kaduna', 'Nigeria', 'North West'),
('Kumasi Central Market', 'Ashanti', 'Ghana', 'Ashanti'),
('Accra Makola Market', 'Greater Accra', 'Ghana', 'Greater Accra'),
('Wakulima Market', 'Nairobi', 'Kenya', 'Nairobi'),
('Kongowea Market', 'Mombasa', 'Kenya', 'Coast')
ON CONFLICT DO NOTHING;

-- =====================
-- PRICES (sample prices per crop per market)
-- =====================
-- We use subqueries to get the IDs dynamically
INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 350.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Maize' AND m.name = 'Mile 12 Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 320.00, 'kg', 'down', 'seed'
FROM crops c, markets m WHERE c.name = 'Maize' AND m.name = 'Kano Central Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 340.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Maize' AND m.name = 'Bodija Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 750.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Rice' AND m.name = 'Mile 12 Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 720.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Rice' AND m.name = 'Kano Central Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 760.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Rice' AND m.name = 'Onitsha Main Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 600.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Yam' AND m.name = 'Bodija Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 580.00, 'kg', 'down', 'seed'
FROM crops c, markets m WHERE c.name = 'Yam' AND m.name = 'Ogbete Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 620.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Yam' AND m.name = 'Onitsha Main Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 150.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Cassava' AND m.name = 'Mile 12 Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 140.00, 'kg', 'down', 'seed'
FROM crops c, markets m WHERE c.name = 'Cassava' AND m.name = 'Creek Road Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 800.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Tomato' AND m.name = 'Mile 12 Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 750.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Tomato' AND m.name = 'Kano Central Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 820.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Tomato' AND m.name = 'Dawanau Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 500.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Onion' AND m.name = 'Kano Central Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 520.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Onion' AND m.name = 'Galadima Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 280.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Sorghum' AND m.name = 'Dawanau Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 600.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Cowpea' AND m.name = 'Kano Central Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 900.00, 'kg', 'up', 'seed'
FROM crops c, markets m WHERE c.name = 'Groundnut' AND m.name = 'Kano Central Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 400.00, 'kg', 'stable', 'seed'
FROM crops c, markets m WHERE c.name = 'Plantain' AND m.name = 'Mile 12 Market';

INSERT INTO prices (crop_id, market_id, price_per_unit, unit, trend, source)
SELECT c.id, m.id, 380.00, 'kg', 'down', 'seed'
FROM crops c, markets m WHERE c.name = 'Plantain' AND m.name = 'Creek Road Market';

-- =====================
-- SAMPLE BUYERS
-- =====================
INSERT INTO buyers (name, phone, company, buyer_type, crops, states, countries, min_quantity, max_quantity, unit, rating, is_verified) VALUES
('Emeka Traders Ltd', '+2348012345678', 'Emeka Traders', 'aggregator', ARRAY['Maize', 'Rice', 'Sorghum'], ARRAY['Lagos', 'Ogun'], ARRAY['Nigeria'], 500, 50000, 'kg', 4.5, true),
('North Grain Export Co', '+2347098765432', 'North Grain', 'exporter', ARRAY['Maize', 'Sorghum', 'Cowpea', 'Groundnut'], ARRAY['Kano', 'Sokoto', 'Kaduna'], ARRAY['Nigeria'], 1000, 100000, 'kg', 4.8, true),
('Lagos Fresh Foods', '+2348023456789', 'Lagos Fresh', 'processor', ARRAY['Tomato', 'Onion', 'Plantain'], ARRAY['Lagos'], ARRAY['Nigeria'], 200, 10000, 'kg', 4.2, true),
('Accra Commodities Hub', '+233201234567', 'Accra Commodities', 'aggregator', ARRAY['Maize', 'Cassava', 'Plantain'], ARRAY['Greater Accra', 'Ashanti'], ARRAY['Ghana'], 300, 20000, 'kg', 4.3, true),
('Nairobi Grain Traders', '+254712345678', 'Nairobi Grain', 'exporter', ARRAY['Maize', 'Rice', 'Cowpea'], ARRAY['Nairobi', 'Mombasa'], ARRAY['Kenya'], 1000, 80000, 'kg', 4.6, true)
ON CONFLICT DO NOTHING;