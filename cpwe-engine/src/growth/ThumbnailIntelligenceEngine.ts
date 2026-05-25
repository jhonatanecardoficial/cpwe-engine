import { VisualIdentityProfile } from '../channel/VisualIdentityProfile';

export class ThumbnailIntelligenceEngine {
  private thumbnailMemory: string[] = [];

  /**
   * Evaluates if a thumbnail follows the DNA and isn't repeating.
   * Crucial to avoid visual fatigue.
   */
  public scoreThumbnailDesign(proposedDesignMetadata: string) {
    // Basic anti-fatigue check
    if (this.thumbnailMemory.includes(proposedDesignMetadata)) {
      return { 
        approved: false, 
        reason: "Visual fatigue detected. Pattern already used recently. Need more visual entropy." 
      };
    }

    // Keep only the last 10 thumbnails in memory
    this.thumbnailMemory.push(proposedDesignMetadata);
    if (this.thumbnailMemory.length > 10) this.thumbnailMemory.shift();

    return { 
      approved: true, 
      memoryUpdated: true,
      appliedRules: VisualIdentityProfile.thumbnails
    };
  }
}
