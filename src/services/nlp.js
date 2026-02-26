const intents = require('../nlp/intents');
const { cropAliases, marketAliases } = require('../nlp/entities');

function classifyIntent(message) {
  const text = message.toLowerCase().trim();

  for (const [key, intent] of Object.entries(intents)) {
    for (const pattern of intent.patterns) {
      if (pattern.test(text)) {
        return intent.name;
      }
    }
  }

  return 'unknown';
}

function extractCrop(message) {
  const text = message.toLowerCase().trim();
  const words = text.split(/\s+/);

  // Check single words
  for (const word of words) {
    const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, '');
    if (cropAliases[clean]) return cropAliases[clean];
  }

  // Check two-word combinations (e.g. "guinea corn")
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (cropAliases[phrase]) return cropAliases[phrase];
  }

  return null;
}

function extractMarket(message) {
  const text = message.toLowerCase().trim();

  // Check two-word combinations first (e.g. "mile 12", "port harcourt")
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (marketAliases[phrase]) return marketAliases[phrase];
  }

  // Check single words
  for (const word of words) {
    const clean = word.replace(/[^a-zA-Z0-9]/g, '');
    if (marketAliases[clean]) return marketAliases[clean];
  }

  return null;
}

function parseMessage(message) {
  return {
    intent: classifyIntent(message),
    crop: extractCrop(message),
    market: extractMarket(message),
    raw: message
  };
}

module.exports = { parseMessage, classifyIntent, extractCrop, extractMarket };