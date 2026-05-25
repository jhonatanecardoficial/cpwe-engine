export class CTRAnalyzer {
  /**
   * Calculates CTR to determine if the Thumbnail DNA is actually working.
   */
  public analyzeThumbnailCTR(impressions: number, clicks: number) {
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    let score = "poor";
    if (ctr > 8) score = "excellent";
    else if (ctr > 5) score = "good";
    else if (ctr > 3) score = "average";

    return {
      ctr,
      score,
      actionableInsight: ctr < 5 
        ? "Needs higher visual contrast and fewer words to meet the 'high-contrast' and 'max 3-5 words' DNA rules." 
        : "Thumbnail style validated. Premium dark tones are converting."
    };
  }
}
