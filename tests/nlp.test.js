require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { parseMessage } = require('../src/services/nlp');

const testMessages = [
  'hello',
  'price of maize in kano',
  'I harvested maize last week, what can I get for it?',
  'my yam is ready to go',
  'abeg how much dem dey buy tomato for market',
  'I want to sell my rice',
  'register',
  'find buyer',
];

async function runTests() {
  console.log('🧪 Testing NLP pipeline...\n');

  for (const msg of testMessages) {
    const result = await parseMessage(msg);
    console.log(`📩 "${msg}"`);
    console.log(`   → Intent: ${result.intent} | Crop: ${result.crop} | Market: ${result.market}`);
    console.log('');
  }
}

runTests();