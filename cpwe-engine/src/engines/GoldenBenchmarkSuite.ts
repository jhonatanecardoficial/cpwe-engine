/**
 * 🏆 Golden Benchmark Suite (Channel-Normalized)
 * 
 * Not all YouTube channels behave the same. A slow-paced storytelling channel
 * doesn't need a hyper-aggressive 5-second hook like an AI Automation channel does.
 * 
 * This suite provides the normalized dynamic QA Thresholds based on the channel class.
 */

export interface QAThresholds {
  min_hook_retention: number;
  min_view_velocity: number;
  min_title_match: number;
  min_narrative_density: number;
  overall_pass_score: number;
}

export const ChannelBenchmarks: Record<string, QAThresholds> = {
  'ai_automation_channel': {
    min_hook_retention: 0.85, // Highly competitive, needs massive hook
    min_view_velocity: 0.80,
    min_title_match: 0.90,
    min_narrative_density: 0.75,
    overall_pass_score: 0.82
  },
  'storytelling_documentary': {
    min_hook_retention: 0.60, // Slower burn is acceptable
    min_view_velocity: 0.70,
    min_title_match: 0.80,
    min_narrative_density: 0.90, // Narrative must be incredibly tight
    overall_pass_score: 0.75
  },
  'vlog_entertainment': {
    min_hook_retention: 0.80,
    min_view_velocity: 0.85,
    min_title_match: 0.70, // Can be slightly clickbaity
    min_narrative_density: 0.65,
    overall_pass_score: 0.78
  }
};

export function getBenchmarksForChannel(channelClass: string): QAThresholds {
  const benchmark = ChannelBenchmarks[channelClass];
  if (!benchmark) {
    console.warn(`[BENCHMARK] Unknown channel class '${channelClass}'. Falling back to strict default.`);
    return ChannelBenchmarks['ai_automation_channel'];
  }
  return benchmark;
}