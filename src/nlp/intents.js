const intents = {
  PRICE_CHECK: {
    name: 'price_check',
    patterns: [
      // English
      /price\s+of\s+(\w+)/i,
      /how much\s+(?:is|for)?\s*(\w+)/i,
      /(\w+)\s+price/i,
      /cost\s+of\s+(\w+)/i,
      /wetin\s+be\s+price/i,
      /kilos?\s+of\s+(\w+)/i,
      /(\w+)\s+cost/i,
      /^1$/,
      /current\s+price/i,
      /market\s+price/i,
      /what.*(?:going\s+for|selling\s+for)/i,
      /how\s+much\s+(?:is|are|dem)/i,
      /wetin.*worth/i,
      // Pidgin
      /wetin\s+dem\s+dey\s+sell/i,
      /abeg.*price/i,
      /how\s+much\s+dem\s+dey/i,
      /na\s+how\s+much/i,
      /how\s+e\s+dey\s+go/i,
      // Hausa
      /nawa\s+ne\s+farashi/i,
      /farashi\s+na/i,
      /farashin/i,
      /nawa\s+ake\s+sayarwa/i,
      // Yoruba
      /elo\s+ni/i,
      /iye\s+owo/i,
      /e\s+je\s+melo/i,
      /melo\s+ni/i,
      // Igbo
      /ego\s+ole/i,
      /ole\s+ego/i,
      /onu\s+ahia/i,
    ]
  },

  BUYER_SEARCH: {
    name: 'buyer_search',
    patterns: [
      // English
      /find\s+buyer/i,
      /who\s+(?:is\s+)?buying/i,
      /buyer\s+for\s+(\w+)/i,
      /i\s+want\s+to\s+sell/i,
      /where\s+(?:can\s+i\s+)?sell/i,
      /connect\s+(?:me\s+)?(?:to\s+)?buyer/i,
      /market\s+for\s+(\w+)/i,
      /^2$/,
      /ready\s+to\s+(?:sell|go)/i,
      /(?:harvest|harvested)/i,
      /looking\s+for\s+(?:a\s+)?buyer/i,
      /who\s+(?:can|will)\s+buy/i,
      /sell\s+my/i,
      /want\s+to\s+dispose/i,
      /need\s+(?:a\s+)?buyer/i,
      /where\s+to\s+sell/i,
      // Pidgin
      /abeg.*buy/i,
      /who\s+go\s+buy/i,
      /i\s+wan\s+sell/i,
      /who\s+dey\s+buy/i,
      /e\s+don\s+ripe/i,
      /don\s+harvest/i,
      // Hausa
      /ina\s+mai\s+siye/i,
      /wanda\s+zai\s+saya/i,
      /nema\s+mai\s+siya/i,
      /ina\s+zan\s+sayar/i,
      /mai\s+siya/i,
      // Yoruba
      /ta\s+ra/i,
      /eni\s+ti\s+o\s+ra/i,
      /wa\s+olura/i,
      /mo\s+fe\s+ta/i,
      /ta\s+kaakiri/i,
      // Igbo
      /choo\s+onye\s+na-azu/i,
      /achoro\s+ire/i,
      /onye\s+ga-azu/i,
      /a\s+na-azu/i,
    ]
  },

  REGISTER: {
    name: 'register',
    patterns: [
      // English
      /register/i,
      /sign\s*up/i,
      /join/i,
      /create\s+account/i,
      /new\s+farmer/i,
      /i\s+am\s+a\s+farmer/i,
      /i\s+want\s+to\s+join/i,
      /^3$/,
      /add\s+me/i,
      /how\s+do\s+i\s+(?:join|register|sign)/i,
      // Pidgin
      /i\s+wan\s+join/i,
      /add\s+my\s+name/i,
      /put\s+my\s+name/i,
      // Hausa
      /yi\s+rajista/i,
      /ina\s+son\s+rajista/i,
      /rajista/i,
      /shigar\s+da\s+sunana/i,
      // Yoruba
      /forukosile/i,
      /forúkọsílẹ/i,
      /mo\s+fe\s+darapọ/i,
      /se\s+akosile/i,
      // Igbo
      /debanye\s+aha/i,
      /achoro\s+itebanye/i,
      /tinye\s+aha/i,
    ]
  },

  HELP: {
    name: 'help',
    patterns: [
      // English
      /^help$/i,
      /what\s+can\s+you\s+do/i,
      /how\s+(?:does\s+this\s+work|do\s+i\s+use)/i,
      /^menu$/i,
      /^start$/i,
      /^hi$/i,
      /^hello$/i,
      /^hey$/i,
      /^good\s+(?:morning|afternoon|evening)/i,
      /what\s+is\s+this/i,
      /how\s+do\s+you\s+work/i,
      // Pidgin
      /^how\s+far$/i,
      /wetin\s+you\s+fit\s+do/i,
      /how\s+e\s+work/i,
      /^omo$/i,
      // Hausa
      /^sannu$/i,
      /^barka$/i,
      /yaya\s+ake\s+amfani/i,
      /menene\s+zaka\s+iya/i,
      // Yoruba
      /^e\s+kaaro$/i,
      /^e\s+kaasan$/i,
      /^bawo$/i,
      /kini\s+o\s+le\s+se/i,
      // Igbo
      /^nnoo$/i,
      /^kedụ$/i,
      /gịnị\s+i\s+nwere/i,
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
      /price\s+(?:rising|falling|dropping)/i,
      /will\s+price\s+(?:go|rise|drop)/i,
      /best\s+time\s+to\s+sell/i,
      /when\s+(?:should|to)\s+sell/i,
      // Pidgin
      /price\s+don\s+go\s+up/i,
      /price\s+don\s+fall/i,
      /when\s+e\s+go\s+better/i,
    ]
  },

  SUBSCRIBE: {
    name: 'subscribe',
    patterns: [
      /subscribe/i,
      /premium/i,
      /upgrade/i,
      /unlimited/i,
      /^pay$/i,
      /subscription/i,
      /more\s+queries/i,
      /remove\s+limit/i,
      /pay\s+for/i,
    ]
  }
};

module.exports = intents;