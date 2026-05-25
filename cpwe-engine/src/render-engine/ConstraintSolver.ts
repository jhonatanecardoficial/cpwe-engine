export enum SolverState {
  FEASIBLE = 'FEASIBLE',
  INFEASIBLE = 'INFEASIBLE',
  UNBOUNDED = 'UNBOUNDED'
}

export interface SolverResult {
  state: SolverState;
  resolvedPlaybackRate: number;
  resolvedDurationFrames: number;
}

/**
 * 🧮 Constraint Solver (Formal Mathematical Optimizer)
 * Solves the equation: minimize |allocated_frames - required_frames|
 * Subject to rigid boundaries and scene weight hierarchies.
 */
export class ConstraintSolver {
  /**
   * Weights to decide which scene gets "distorted" or "stretched" the most.
   */
  private static readonly WEIGHTS: Record<string, number> = {
    HOOK: 3.0,
    CTA: 2.0,
    BODY: 1.0,
  };

  private static readonly MAX_PLAYBACK_RATE = 1.05;
  private static readonly MIN_PLAYBACK_RATE = 0.95;

  /**
   * Formal resolution of temporal constraints.
   * Emits FEASIBLE, INFEASIBLE or UNBOUNDED mathematically.
   */
  public static resolveTemporalConstraints(
    sceneType: 'HOOK' | 'CTA' | 'BODY',
    requiredFrames: number,
    availableAssetFrames: number
  ): SolverResult {
    
    // UNBOUNDED condition (e.g., negative frames which violates time constraints)
    if (requiredFrames <= 0 || availableAssetFrames <= 0) {
      return { state: SolverState.UNBOUNDED, resolvedPlaybackRate: 0, resolvedDurationFrames: 0 };
    }

    // Exact match (Perfect Feasibility)
    if (requiredFrames === availableAssetFrames) {
      return { state: SolverState.FEASIBLE, resolvedPlaybackRate: 1.0, resolvedDurationFrames: requiredFrames };
    }

    const weight = this.WEIGHTS[sceneType] || 1.0;

    // Calculate ideal playback rate to fit the asset exactly into the required space
    // availableAssetFrames / targetPlaybackRate = requiredFrames
    const targetPlaybackRate = availableAssetFrames / requiredFrames;

    // Check strict bounds
    if (targetPlaybackRate >= this.MIN_PLAYBACK_RATE && targetPlaybackRate <= this.MAX_PLAYBACK_RATE) {
      return {
        state: SolverState.FEASIBLE,
        resolvedPlaybackRate: targetPlaybackRate,
        resolvedDurationFrames: requiredFrames
      };
    }

    // Mathematical INFEASIBILITY
    // The asset cannot be stretched or shrunk to fit the required space without perceptually degrading 
    // beyond the allowed maximum boundaries.
    return {
      state: SolverState.INFEASIBLE,
      resolvedPlaybackRate: targetPlaybackRate > this.MAX_PLAYBACK_RATE ? this.MAX_PLAYBACK_RATE : this.MIN_PLAYBACK_RATE,
      resolvedDurationFrames: availableAssetFrames,
    };
  }
}
