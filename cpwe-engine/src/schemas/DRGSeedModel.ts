import { createHash } from 'crypto';

/**
 * 🔒 Cryptographically Anchored Seed with Version Control
 * Ensures full reproducibility across environments, while guaranteeing backward 
 * compatibility for historical graphs via SCHEMA_VERSION.
 */
export class DRGSeedModel {
  /**
   * The compiler schema version. 
   * Modifying the timeline/resolver algorithms requires bumping this version
   * to ensure older graphs don't break determinism if re-compiled.
   */
  public static readonly SCHEMA_VERSION = 'v1.0.0';

  /**
   * Generates a deterministic SHA-256 hash from inputs.
   */
  private static hash(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  /**
   * Generates the immutable scene seed anchored by Schema Version and Global Seed.
   */
  public static computeSceneSeed(globalSeed: string, sceneIndex: number): string {
    return this.hash(`${this.SCHEMA_VERSION}_${globalSeed}_scene_${sceneIndex}`);
  }

  /**
   * Generates the semantic asset seed based on the scene seed and emotion state.
   */
  public static computeAssetSeed(sceneSeed: string, emotionState: string, assetType: string): string {
    return this.hash(`${sceneSeed}_${emotionState}_${assetType}`);
  }
}
