const { parseMessage } = require('../services/nlp');
const { sendMessage } = require('../services/whatsapp');
const { getSession, setSession, clearSession, logConversation } = require('../services/sessionService');
const { getFarmerByPhone, createFarmer, updateFarmer, checkQueryLimit, incrementQueryCount } = require('../services/farmerService');
const { getPriceForCropAndMarket, getAllPricesForCropFormatted, formatPriceResponse } = require('../services/priceService');
const { findBuyersForCrop, formatBuyerResponse } = require('../services/buyerService');
const { getResponse } = require('../nlp/responses');

async function webhookRoutes(fastify, options) {

  // Twilio sends a POST with form data when a message arrives
  fastify.post('/', async (request, reply) => {
    const { Body, From, MediaUrl0 } = request.body;

    // Twilio sends From as "whatsapp:+2348012345678" — strip the prefix
    const phone = From.replace('whatsapp:', '');
    const message = (Body || '').trim();

    console.log(`📩 Message from ${phone}: ${message}`);

    // Acknowledge Twilio immediately (must respond fast)
    reply.code(200).send('OK');

    // Process message asynchronously
    try {
      await processMessage(phone, message);
    } catch (err) {
      console.error('❌ Error processing message:', err.message);
    }
  });

  // Health check for webhook
  fastify.get('/', async (request, reply) => {
    return { status: 'webhook ready' };
  });
}

async function processMessage(phone, message) {
  const farmer = await getFarmerByPhone(phone);
  const session = await getSession(phone);
  const language = farmer?.language || 'en';

  // Handle all active session states
  if (session && session.state !== 'idle') {

    // Awaiting crop for price check
    if (session.state === 'awaiting_crop_for_price') {
      await clearSession(phone);
      const parsed = { crop: require('../services/nlp').extractCrop(message) || message, market: null, raw: message };
      return handlePriceCheck(phone, parsed, language, farmer);
    }

    // Awaiting crop for buyer search
    if (session.state === 'awaiting_crop_for_buyer') {
      await clearSession(phone);
      const parsed = { crop: require('../services/nlp').extractCrop(message) || message, market: null, raw: message };
      return handleBuyerSearch(phone, parsed, language, farmer);
    }

    // Registration flow
    return handleRegistrationFlow(phone, message, session, language);
  }

  // Parse intent and entities
  const parsed = parseMessage(message);
  console.log(`🧠 Intent: ${parsed.intent} | Crop: ${parsed.crop} | Market: ${parsed.market}`);

  switch (parsed.intent) {
    case 'help':
      return handleHelp(phone, language, farmer);
    case 'register':
      return handleRegisterStart(phone, language);
    case 'price_check':
      return handlePriceCheck(phone, parsed, language, farmer);
    case 'buyer_search':
      return handleBuyerSearch(phone, parsed, language, farmer);
    case 'price_trend':
      return handlePriceTrend(phone, parsed, language, farmer);
    case 'subscribe':
      return handleSubscribe(phone, language);
    default:
      if (!farmer) {
        const msg = getResponse('welcome', language);
        await sendMessage(phone, msg);
        await logConversation(phone, message, msg, 'welcome', {});
      } else {
        const msg = getResponse('unknown', language);
        await sendMessage(phone, msg);
        await logConversation(phone, message, msg, 'unknown', {});
      }
  }
}

// ─── HANDLERS ────────────────────────────────────────────────────────────────

async function handleHelp(phone, language, farmer) {
  const msg = farmer
    ? getResponse('help', language)
    : getResponse('welcome', language);
  await sendMessage(phone, msg);
  await logConversation(phone, 'help', msg, 'help', {});
}

async function handleRegisterStart(phone, language) {
  const msg = getResponse('register_start', language);
  await sendMessage(phone, msg);
  await setSession(phone, 'register_name', {});
}

async function handleRegistrationFlow(phone, message, session, language) {
  const state = session.state;
  const context = session.context || {};

  if (state === 'register_name') {
    context.name = message;
    await setSession(phone, 'register_location', context);
    const msg = getResponse('register_location', language);
    return sendMessage(phone, msg);
  }

  if (state === 'register_location') {
    context.location = message;
    context.state = message;
    await setSession(phone, 'register_crops', context);
    const msg = getResponse('register_crops', language);
    return sendMessage(phone, msg);
  }

  if (state === 'register_crops') {
    // Parse crops from comma-separated input
    context.crops = message.split(',').map(c => c.trim());
    await setSession(phone, 'register_language', context);
    const msg = getResponse('register_language', language);
    return sendMessage(phone, msg);
  }

  if (state === 'register_language') {
    const langMap = { '1': 'en', '2': 'ha', '3': 'yo', '4': 'ig' };
    context.language = langMap[message.trim()] || 'en';

    // Save farmer to database
    await createFarmer(phone, context);
    await clearSession(phone);

    const msg = getResponse('register_complete', context.language, context.name);
    return sendMessage(phone, msg);
  }

  // Unknown state — reset
  await clearSession(phone);
  const msg = getResponse('help', language);
  return sendMessage(phone, msg);
}

async function handlePriceCheck(phone, parsed, language, farmer) {
  const limit = await checkQueryLimit(phone);
  if (!limit.allowed) {
    const msg = getResponse('rate_limit', language);
    await sendMessage(phone, msg);
    return logConversation(phone, parsed.raw, msg, 'rate_limit', {});
  }

  const { crop, market } = parsed;

  if (!crop) {
    await setSession(phone, 'awaiting_crop_for_price', {});
    const msg = `💰 *Check Crop Price*\n\nWhich crop do you want to check?\n\nExample: _Maize, Rice, Yam, Cassava, Tomato, Onion_`;
    await sendMessage(phone, msg);
    return;
  }

  if (!market) {
    const msg = await getAllPricesForCropFormatted(crop);
    if (!msg) {
      const notFound = getResponse('price_not_found', language);
      await sendMessage(phone, notFound);
      return logConversation(phone, parsed.raw, notFound, 'price_check', { crop });
    }
    await sendMessage(phone, msg);
    await incrementQueryCount(phone);
    return logConversation(phone, parsed.raw, msg, 'price_check', { crop });
  }

  const priceData = await getPriceForCropAndMarket(crop, market);
  if (!priceData) {
    const msg = getResponse('price_not_found', language);
    await sendMessage(phone, msg);
    return logConversation(phone, parsed.raw, msg, 'price_check', { crop, market });
  }

  const msg = formatPriceResponse(priceData);
  await sendMessage(phone, msg);
  await incrementQueryCount(phone);
  await logConversation(phone, parsed.raw, msg, 'price_check', { crop, market });
}

async function handleBuyerSearch(phone, parsed, language, farmer) {
  const crop = parsed.crop;

  if (!crop) {
    // Set session to wait for crop name
    await setSession(phone, 'awaiting_crop_for_buyer', {});
    const msg = `🛒 *Find a Buyer*\n\nWhich crop do you want to sell?\n\nExample: _Maize, Rice, Yam, Cassava, Tomato_`;
    await sendMessage(phone, msg);
    return;
  }

  const country = farmer?.country || 'Nigeria';
  const buyers = await findBuyersForCrop(crop, country);

  if (!buyers || buyers.length === 0) {
    const msg = getResponse('buyer_not_found', language);
    await sendMessage(phone, msg);
    return logConversation(phone, parsed.raw, msg, 'buyer_search', { crop });
  }

  const msg = formatBuyerResponse(buyers, crop);
  await sendMessage(phone, msg);
  await logConversation(phone, parsed.raw, msg, 'buyer_search', { crop });
}

async function handlePriceTrend(phone, parsed, language, farmer) {
  const { crop, market } = parsed;

  if (!crop) {
    const msg = `📈 Which crop trend do you want?\n\nExample: _"Maize price trend in Kano"_`;
    await sendMessage(phone, msg);
    return;
  }

  // For now show all prices with trends as a basic forecast
  const msg = await getAllPricesForCropFormatted(crop);
  if (!msg) {
    const notFound = getResponse('price_not_found', language);
    return sendMessage(phone, notFound);
  }

  const trendMsg = `📈 *Price Trend for ${crop}*\n\n` + msg +
    `\n\n_📊 Tip: Buy when trend shows 📉, sell when it shows 📈_`;

  await sendMessage(phone, trendMsg);
  await logConversation(phone, parsed.raw, trendMsg, 'price_trend', { crop, market });
}

async function handleSubscribe(phone, language) {
  const msg = `⭐ *FarmConnect AI Premium*\n\n` +
    `Unlimited price checks daily\n` +
    `Priority buyer matching\n` +
    `Weekly price alerts\n\n` +
    `💳 *₦200/week* via airtime\n\n` +
    `To subscribe, send *FARMCONNECT* to *32xxx*\n` +
    `or reply *"pay"* to get payment link.\n\n` +
    `_Coming soon: USSD & airtime payment_`;

  await sendMessage(phone, msg);
  await logConversation(phone, 'subscribe', msg, 'subscribe', {});
}

module.exports = webhookRoutes;