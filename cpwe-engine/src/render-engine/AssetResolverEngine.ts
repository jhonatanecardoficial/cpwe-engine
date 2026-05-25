import { DRGSeedModel } from '../schemas/DRGSeedModel';
import { EmotionState } from '../schemas/EmotionTaxonomy';
import { join } from 'path';

/**
 * 🗃️ Asset Resolver Engine (Pure Function)
 * PURE FUNCTION: Maps an EmotionState + AssetSeed to a physical video file.
 * No internal state. No memory. Fully reproducible.
 */
export class AssetResolverEngine {
  // Mocked physical registry of what exists in /assets/broll/
  private static readonly PHYSICAL_REGISTRY: Record<EmotionState, string[]> = {
    HIGH_TENSION: [
      'assets/broll/finance/market_crash.mp4',
      'assets/broll/finance/red_candles.mp4',
      'assets/broll/ai/server_fire.mp4'
    ],
    CURIOUSITY_SPIKE: [
      'assets/broll/ai/neural_network_glowing.mp4',
      'assets/broll/finance/vault_opening.mp4'
    ],
    FEAR_OF_MISSING_OUT: [
      'assets/broll/finance/golden_coins_falling.mp4',
      'assets/broll/crypto/bitcoin_rally.mp4'
    ],
    ANALYTICAL_MODE: [
      'assets/broll/finance/dashboard_green.mp4',
      'assets/broll/ai/code_scrolling.mp4'
    ],
    BREAKDOWN_SEQUENCE: [
      'assets/broll/finance/blueprint_animation.mp4',
      'assets/broll/ai/matrix_grid.mp4'
    ]
  };

  /**
   * PURE FUNCTION
   * Selects an asset using the cryptographic seed to ensure determinism.
   * Includes pseudo-normalization via modulo arithmetic to avoid bias.
   */
  public static resolve(emotionState: EmotionState, assetSeed: string): string {
    const availableAssets = this.PHYSICAL_REGISTRY[emotionState] || this.PHYSICAL_REGISTRY['ANALYTICAL_MODE'];
    
    if (availableAssets.length === 0) {
      throw new Error(`CRITICAL COMPILE ERROR: No assets found for EmotionState '${emotionState}'.`);
    }

    // Convert seed hash to a numeric index mathematically
    let numericValue = 0;
    for (let i = 0; i < 8; i++) {
      numericValue += assetSeed.charCodeAt(i);
    }

    // Anti-bias deterministic selection
    const index = numericValue % availableAssets.length;
    
    // Resolve absolute path
    return join(process.cwd(), availableAssets[index]);
  }
}
