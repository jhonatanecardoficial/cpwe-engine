import { DRGModel, SceneIR } from '../schemas/DRGModel';
import { AssetResolverEngine } from './AssetResolverEngine';
import { DRGSeedModel } from '../schemas/DRGSeedModel';
import { ConstraintSolver, SolverState } from './ConstraintSolver';
import { ExecutionIR, ExecutionIRNode } from '../schemas/ExecutionIR';
import { CompilerError, CompilerErrorType } from '../schemas/CompilerErrors';
import { createHash } from 'crypto';

export class TimelineBuilder {
  /**
   * LOWERING PASS 1: Abstract Script -> DRG (High Level IR)
   */
  public static compileToDRG(
    globalRenderSeed: string,
    targetFps: number,
    abstractScenes: Array<{ id: string; emotion: any; type: 'HOOK'|'CTA'|'BODY'; requiredFrames: number }>
  ): DRGModel {
    
    const compiledScenes: SceneIR[] = [];
    let currentGlobalOffset = 0;

    for (let i = 0; i < abstractScenes.length; i++) {
      const absScene = abstractScenes[i];
      
      const sceneSeed = DRGSeedModel.computeSceneSeed(globalRenderSeed, i);
      const assetSeed = DRGSeedModel.computeAssetSeed(sceneSeed, absScene.emotion, absScene.type);

      let physicalAsset: string;
      try {
        physicalAsset = AssetResolverEngine.resolve(absScene.emotion, assetSeed);
      } catch (err: any) {
        throw new CompilerError(CompilerErrorType.ASSET_FAIL, `Asset Resolution failed for scene ${absScene.id}: ${err.message}`);
      }

      const availableAssetFrames = 300; // Mocked

      const solverResult = ConstraintSolver.resolveTemporalConstraints(
        absScene.type,
        absScene.requiredFrames,
        availableAssetFrames
      );

      // 🔴 COMPILER HARD FAIL ON INFEASIBLE OR UNBOUNDED
      if (solverResult.state === SolverState.INFEASIBLE || solverResult.state === SolverState.UNBOUNDED) {
        throw new CompilerError(
          CompilerErrorType.GRAPH_FAIL, 
          `Failed to solve constraints for Scene ${absScene.id}. State: ${solverResult.state}. Math bounds violated.`
        );
      }

      const node: SceneIR = {
        scene_id: absScene.id,
        emotion_state: absScene.emotion,
        frame_index: currentGlobalOffset,
        start_time_ms: (currentGlobalOffset / targetFps) * 1000,
        duration_frames: solverResult.resolvedDurationFrames,
        global_time_offset: currentGlobalOffset,
        resolved_background_asset: physicalAsset,
        motion_intensity: absScene.type === 'HOOK' ? 1.0 : 0.5,
        playback_rate: solverResult.resolvedPlaybackRate,
        transition_out: { type: 'CUT', easing: 'LINEAR', duration_frames: 0 }
      };

      compiledScenes.push(node);
      currentGlobalOffset += node.duration_frames;
    }

    return {
      global_render_seed: globalRenderSeed,
      target_fps: targetFps,
      target_resolution: '1920x1080',
      total_duration_frames: currentGlobalOffset,
      scenes: compiledScenes
    };
  }

  /**
   * LOWERING PASS 2: DRG (High Level IR) -> Execution IR (Memory Model)
   */
  public static lowerToExecutionIR(drg: DRGModel): ExecutionIR {
    const execNodes: ExecutionIRNode[] = drg.scenes.map((scene, index) => {
      // Memory Layout Translation (No specific executor technology injected here)
      return {
        asset_pointer: scene.resolved_background_asset!,
        start_ms: scene.start_time_ms,
        duration_frames: scene.duration_frames,
        render_layer: 0, // Background
        opacity_state: 1.0,
        transform_state: {
          playback_rate: scene.playback_rate,
          scale: 1.0
        }
      };
    });

    const checksumHash = createHash('sha256').update(JSON.stringify(execNodes)).digest('hex');

    return {
      compiler_checksum: checksumHash,
      schema_version: DRGSeedModel.SCHEMA_VERSION,
      total_duration_frames: drg.total_duration_frames,
      target_fps: drg.target_fps,
      target_resolution: drg.target_resolution,
      memory_layout: execNodes
    };
  }
}
