const responses = {
  en: {
    welcome: `🌾 *Welcome to FarmConnect AI!*\n\nI help farmers get the best prices for their crops.\n\nWhat can I do for you?\n1️⃣ Check crop prices\n2️⃣ Find buyers\n3️⃣ Register as a farmer\n\nTry: _"Price of maize in Kano"_`,

    help: `🌾 *FarmConnect AI - How to use:*\n\n📊 *Check prices:*\n"Price of maize in Lagos"\n"How much is rice in Kano"\n\n🛒 *Find buyers:*\n"Find buyer for maize"\n"I want to sell yam"\n\n👤 *Register:*\n"Register" or "Join"\n\n📈 *Price trends:*\n"Maize price trend in Kano"`,

    price_not_found: `❌ Sorry, I couldn't find that price.\n\nTry specifying the crop and market:\n_"Price of maize in Kano"_\n_"Rice price in Lagos"_`,

    crop_not_found: `❌ I don't recognize that crop.\n\nCrops I know: Maize, Rice, Yam, Cassava, Tomato, Onion, Sorghum, Cowpea, Groundnut, Plantain`,

    market_not_found: `❌ I don't recognize that market.\n\nTry: Lagos, Kano, Abuja, Onitsha, Port Harcourt, Accra, Nairobi`,

    register_start: `👤 *Let's register you!*\n\nWhat is your full name?`,

    register_location: `📍 What state/city are you in?`,

    register_crops: `🌱 What crops do you farm? (e.g. Maize, Rice, Yam)`,

    register_language: `🌍 Preferred language?\n1. English\n2. Hausa\n3. Yoruba\n4. Igbo`,

    register_complete: (name) => `✅ *Welcome, ${name}!*\n\nYou're now registered on FarmConnect AI.\n\nYou have 3 free price checks per day.\n\nType *"help"* to see what I can do!`,

    rate_limit: `⚠️ You've used your 3 free queries today.\n\nSubscribe for unlimited access:\nReply *"subscribe"* to learn more.`,

    unknown: `🤔 I didn't understand that.\n\nType *"help"* to see what I can do.`,

    buyer_not_found: `❌ No buyers found for that crop in your area right now.\n\nTry a different crop or check back later.`,
  },

  ha: {
    welcome: `🌾 *Barka da zuwa FarmConnect AI!*\n\nNa taimaka manoma samun mafi kyawun farashi.\n\nMe kuke bukata?\n1️⃣ Duba farashin amfanin gona\n2️⃣ Nemo mai siya\n3️⃣ Yi rajista`,

    help: `🌾 *Yadda ake amfani da FarmConnect AI:*\n\n📊 *Duba farashi:*\n"Farashi na masara a Kano"\n\n🛒 *Nemo mai siya:*\n"Nemo mai siya na masara"\n\n👤 *Yi rajista:*\n"Rajista"`,

    unknown: `🤔 Ban fahimci wannan ba.\n\nKa rubuta *"help"* don ganin abin da zan iya yi.`,
  },

  yo: {
    welcome: `🌾 *Ẹ káàbọ̀ sí FarmConnect AI!*\n\nMo ń ràn àwọn àgbẹ̀ lọ́wọ́ láti rí iye owó tó dára jùlọ.\n\nKí ni o fẹ́?\n1️⃣ Ṣayẹwo iye owó irugbin\n2️⃣ Wá olùrà\n3️⃣ Forúkọsílẹ̀`,

    help: `🌾 *Bí a ṣe ń lò FarmConnect AI:*\n\n📊 *Ṣayẹwo iye owó:*\n"Iye owó agbado ní Lagos"\n\n🛒 *Wá olùrà:*\n"Wá olùrà fún agbado"\n\n👤 *Forúkọsílẹ̀:*\n"Forúkọsílẹ̀"`,

    unknown: `🤔 Mi ò yé mi.\n\nTẹ *"help"* láti rí ohun tí mo lè ṣe.`,
  },

  ig: {
    welcome: `🌾 *Nnọọ na FarmConnect AI!*\n\nA na-enyere ndị ọrụ ugbo aka ịnweta ọnụ ahịa kachasị mma.\n\nGịnị ka ị chọrọ?\n1️⃣ Lelee ọnụ ahịa ihe ọkụkụ\n2️⃣ Chọọ onye na-azụ\n3️⃣ Debanye aha`,

    help: `🌾 *Otu esi eji FarmConnect AI:*\n\n📊 *Lelee ọnụ ahịa:*\n"Ọnụ ahịa oka na Lagos"\n\n🛒 *Chọọ onye na-azụ:*\n"Chọọ onye na-azụ oka"\n\n👤 *Debanye aha:*\n"Debanye aha"`,

    unknown: `🤔 Anọghị m ime ihe ahụ.\n\nTụọ *"help"* ịhụ ihe m nwere ike ime.`,
  }
};

function getResponse(key, language = 'en', ...args) {
  const lang = responses[language] || responses.en;
  const template = lang[key] || responses.en[key];

  if (!template) return responses.en.unknown;
  if (typeof template === 'function') return template(...args);
  return template;
}

module.exports = { responses, getResponse };