export const BrandVoiceProfile = {
  tone: ["technical-authority", "premium", "strategic", "direct", "highly-intelligent"],
  ratios: {
    strategicMentor: 0.60,
    technicalOperator: 0.25,
    provocative: 0.15
  },
  speechSpeed: "dynamic", // High information density, no fluff
  rules: {
    strongHookFirst5Seconds: true,
    frequentContextSwitchingForRetention: true,
  },
  forbiddenPhrases: [
    "Fique rico rápido",
    "Dinheiro fácil",
    "Garantido",
    "Método secreto",
    "Hack milagroso",
    "Ganhos absurdos",
  ],
  forbiddenStyles: [
    "infantilized language",
    "grotesque clickbait",
    "illegal financial promises",
    "generic coach phrases",
    "empty motivational catchphrases",
    "cheap motivational coach energy"
  ],
  criticalRule: "Maximize retention WITHOUT sounding like a scam or get-rich-quick scheme."
};
