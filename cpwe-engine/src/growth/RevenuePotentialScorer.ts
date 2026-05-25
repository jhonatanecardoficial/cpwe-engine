import { MonetizationProfile } from '../channel/MonetizationProfile';

export class RevenuePotentialScorer {
  /**
   * Scores topics based on RPM/Revenue potential rather than pure views.
   * Matches the goal: "Monetizar o mais rápido possível via AdSense de alto RPM"
   */
  public scoreTopic(topicName: string, advertiserDensity: number) {
    let score = advertiserDensity * 10;
    
    // Penalize low RPM topics even if they have high view potential
    if (advertiserDensity < 0.5) {
      score -= 5;
    }

    return {
      topicName,
      revenueScore: score,
      recommendedForCurrentStrategy: score > 6,
      alignedWithGoal: MonetizationProfile.futureStrategy.includes("AdSense (initial phase)")
    };
  }
}
