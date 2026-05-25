import { DRGModel } from '../schemas/DRGModel';

/**
 * 🛡️ DRG Validator
 * Runs at COMPILE TIME. 
 * Validates the graph mathematics before any rendering begins.
 */
export class DRGValidator {
  public static validate(drg: DRGModel): void {
    let computedDuration = 0;

    for (let i = 0; i < drg.scenes.length; i++) {
      const scene = drg.scenes[i];
      
      // 1. Validate Timebase continuity
      if (scene.start_time_ms !== (computedDuration / drg.target_fps) * 1000) {
        throw new Error(`[DRG VALIDATION FAILED] Scene ${scene.scene_id} start_time_ms does not align with temporal graph.`);
      }

      computedDuration += scene.duration_frames;
      
      // 2. Validate Physical Asset presence (Mocked here, real implementation uses fs.existsSync)
      if (!scene.resolved_background_asset) {
        throw new Error(`[DRG VALIDATION FAILED] Scene ${scene.scene_id} has unresolved background asset.`);
      }
    }

    // 3. Global Duration Check
    if (computedDuration !== drg.total_duration_frames) {
      throw new Error(`[DRG VALIDATION FAILED] Graph temporal checksum mismatch. Expected ${drg.total_duration_frames}, but calculated ${computedDuration}.`);
    }

    console.log('[DRG VALIDATOR] Graph compiled and mathematically validated. Ready for Render Engine.');
  }
}
