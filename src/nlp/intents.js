const intents = {
  PRICE_CHECK: {
    name: 'price_check',
    patterns: [
      /price\s+of\s+(\w+)/i,
      /how much\s+(?:is|for)?\s*(\w+)/i,
      /(\w+)\s+price/i,
      /cost\s+of\s+(\w+)/i,
      /wetin\s+be\s+price/i,
      /kilos?\s+of\s+(\w+)/i,
      /(\w+)\s+cost/i,
      /^1$/, 
    ]
  },
  BUYER_SEARCH: {
    name: 'buyer_search',
    patterns: [
      /find\s+buyer/i,
      /who\s+(?:is\s+)?buying/i,
      /buyer\s+for\s+(\w+)/i,
      /i\s+want\s+to\s+sell/i,
      /where\s+(?:can\s+i\s+)?sell/i,
      /connect\s+(?:me\s+)?(?:to\s+)?buyer/i,
      /market\s+for\s+(\w+)/i,
      /^2$/,
    ]
  },
  REGISTER: {
    name: 'register',
    patterns: [
      /register/i,
      /sign\s*up/i,
      /join/i,
      /create\s+account/i,
      /new\s+farmer/i,
      /i\s+am\s+a\s+farmer/i,
      /i\s+want\s+to\s+join/i,
      /^3$/,
    ]
  },
  HELP: {
    name: 'help',
    patterns: [
      /help/i,
      /what\s+can\s+you\s+do/i,
      /how\s+(?:does\s+this\s+work|do\s+i\s+use)/i,
      /menu/i,
      /start/i,
      /hi$/i,
      /hello/i,
      /hey/i,
    ]
  },
  PRICE_TREND: {
    name: 'price_trend',
    patterns: [
      /trend/i,
      /going\s+up/i,
      /going\s+down/i,
      /forecast/i,
      /predict/i,
      /future\s+price/i,
      /price\s+(?:next|this)\s+week/i,
    ]
  },
  SUBSCRIBE: {
    name: 'subscribe',
    patterns: [
      /subscribe/i,
      /premium/i,
      /upgrade/i,
      /unlimited/i,
      /pay/i,
    ]
  }
};

module.exports = intents;