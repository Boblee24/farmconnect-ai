require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { syncPricesFromHDX } = require('../src/services/priceSync');

syncPricesFromHDX().then(result => {
  console.log('Done:', result);
  process.exit(0);
}).catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});