export class TopicSaturationEngine {
  private recentTopics: { topic: string, timestamp: number }[] = [];

  /**
   * Prevents the AI from repeating winning topics until they decay.
   * Small channels die by repeating themes.
   */
  public evaluateTopic(topic: string) {
    const decayTime = 7 * 86400000; // 7 days
    
    const isSaturated = this.recentTopics.some(
      t => t.topic.toLowerCase() === topic.toLowerCase() && (Date.now() - t.timestamp) < decayTime
    );

    if (isSaturated) {
      return { 
        approved: false, 
        score: 0, 
        reason: "Topic saturation high. High audience fatigue probability. Wait for temporal decay." 
      };
    }

    this.recentTopics.push({ topic, timestamp: Date.now() });
    return { approved: true, score: 95, reason: "Topic has high novelty score." };
  }
}
