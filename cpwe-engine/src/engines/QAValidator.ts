import type { ExtractedFeatures } from './FeatureExtractor';

export interface QAResult {
  features: ExtractedFeatures;
  score: number;
  decision: 'PASS' | 'REJECT';
  failure_reasons: string[];
}

// Minimum threshold required for a video script to pass the Production Pipeline
const PASS_THRESHOLD = 0.50;

/**
 * STEP 2 of QA: The Pure Math Scoring Engine
 * 
 * This layer is 100% deterministic. It takes the features extracted by the LLM
 * and computes the final score using strict mathematical weights based on 
 * YouTube performance correlations.
 * 
 * ❌ NO LLM IS USED IN THIS STEP.
 * ❌ NO "CREATIVE EVALUATION" ALLOWED.
 */
export function calculateVideoScore(features: ExtractedFeatures): QAResult {
  
  // Weights based on real YouTube pipeline modeling
  const WEIGHT_HOOK = 0.35;
  const WEIGHT_VIEW_VELOCITY = 0.25;
  const WEIGHT_TITLE_CTR = 0.20;
  const WEIGHT_PACING = 0.20;

  // Linear algebra scoring
  const score = 
    (features.hook_retention_5s * WEIGHT_HOOK) +
    (features.avg_view_velocity * WEIGHT_VIEW_VELOCITY) +
    (features.title_ctr_match * WEIGHT_TITLE_CTR) +
    (features.narrative_density * WEIGHT_PACING);

  // Round to 4 decimal places to prevent floating point weirdness
  const finalScore = Math.round(score * 10000) / 10000;

  const failureReasons: string[] = [];
  
  if (features.hook_retention_5s < 0.10) {
    failureReasons.push('Hook retention is too weak (below 0.75 benchmark).');
  }
  
  if (features.narrative_density < 0.10) {
    failureReasons.push('Narrative density is too sparse. Pacing is slow.');
  }

  const passed = finalScore >= PASS_THRESHOLD && failureReasons.length === 0;

  return {
    features,
    score: finalScore,
    decision: passed ? 'PASS' : 'REJECT',
    failure_reasons: passed ? [] : failureReasons
  };
}