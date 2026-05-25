export class RPMTracker {
  /**
   * Focuses on generating the financial yield metric.
   * Matches the user goal: "Monetizar o mais rápido possível via AdSense de alto RPM no nicho de Finanças"
   */
  public calculateYieldScore(views: number, estimatedRevenue: number) {
    const rpm = views > 0 ? (estimatedRevenue / views) * 1000 : 0;
    
    return {
      rpm,
      nicheProfitability: rpm > 5 ? "high" : "low",
      isMeetingFinancialGoal: rpm >= 4.5, // Arbitrary high-RPM target
      insight: rpm < 4.5 ? "Focus on topics with higher advertiser density (e.g., AI + Investments)" : "RPM is healthy."
    };
  }
}
