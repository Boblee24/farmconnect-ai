const intents = require('../nlp/intents');
const { cropAliases, marketAliases } = require('../nlp/entities');
const axios = require('axios');

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-mnli';
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

function classifyIntentWithRegex(message) {
  const text = message.toLowerCase().trim();

  for (const intent of Object.values(intents)) {
    for (const pattern of intent.patterns) {
      if (pattern.test(text)) {
        return intent.name;
      }
    }
  }

  return 'unknown';
}

async function classifyIntent(message) {
  if (!HUGGINGFACE_API_KEY) {
    return classifyIntentWithRegex(message);
  }

  try {
    const candidateLabels = Object.values(intents).map((intent) => intent.name);

    const response = await axios.post(
      HUGGINGFACE_API_URL,
      {
        inputs: message,
        parameters: {
          candidate_labels: candidateLabels,
          multi_label: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    const result = Array.isArray(data) ? data[0] : data;

    if (
      result &&
      Array.isArray(result.labels) &&
      Array.isArray(result.scores) &&
      result.labels.length > 0
    ) {
      const topLabel = result.labels[0];
      const topScore = result.scores[0];
      console.log(`🤖 HuggingFace: "${message}" → ${topLabel} (${(topScore * 100).toFixed(1)}%)`);

      if (typeof topScore === 'number' && topScore < 0.5) {
        return classifyIntentWithRegex(message);
      }

      if (candidateLabels.includes(topLabel)) {
        return topLabel;
      }
    }

    return classifyIntentWithRegex(message);
  } catch (err) {
    console.error(
      'Hugging Face intent classification failed, using regex fallback:',
      err.message || err
    );
    return classifyIntentWithRegex(message);
  }
  
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

async function parseMessage(message) {
  return {
    intent: await classifyIntent(message),
    crop: extractCrop(message),
    market: extractMarket(message),
    raw: message,
  };
}

module.exports = { parseMessage, classifyIntent, extractCrop, extractMarket };