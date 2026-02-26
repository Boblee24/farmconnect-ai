-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  location VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'Nigeria',
  language VARCHAR(10) DEFAULT 'en',
  crops TEXT[],
  is_subscribed BOOLEAN DEFAULT FALSE,
  subscription_expires_at TIMESTAMP,
  query_count INTEGER DEFAULT 0,
  query_reset_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Markets table
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(50) DEFAULT 'Nigeria',
  region VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  local_names JSONB,
  category VARCHAR(50),
  unit VARCHAR(20) DEFAULT 'kg',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prices table
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id),
  market_id UUID REFERENCES markets(id),
  price_per_unit DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  trend VARCHAR(10) DEFAULT 'stable',
  source VARCHAR(50) DEFAULT 'manual',
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  company VARCHAR(100),
  buyer_type VARCHAR(50),
  crops TEXT[],
  states TEXT[],
  countries TEXT[],
  min_quantity DECIMAL(10,2),
  max_quantity DECIMAL(10,2),
  unit VARCHAR(20) DEFAULT 'kg',
  rating DECIMAL(3,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES farmers(id),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  intent VARCHAR(50),
  entities JSONB,
  direction VARCHAR(10) DEFAULT 'inbound',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (conversation state)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  state VARCHAR(50) DEFAULT 'idle',
  context JSONB DEFAULT '{}',
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prices_crop_id ON prices(crop_id);
CREATE INDEX IF NOT EXISTS idx_prices_market_id ON prices(market_id);
CREATE INDEX IF NOT EXISTS idx_prices_recorded_at ON prices(recorded_at);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_farmer_id ON conversations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_phone ON sessions(phone);
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);