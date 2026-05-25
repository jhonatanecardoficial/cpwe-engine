import { z } from 'zod';
import { EmotionTaxonomy } from './EmotionTaxonomy';

/**
 * Transition IR
 * Strict semantics for visual state continuity between scenes.
 */
const TransitionIRSchema = z.strictObject({
  type: z.enum(['CUT', 'FADE', 'ZOOM', 'GLITCH', 'WIPE']),
  easing: z.enum(['LINEAR', 'EASE_IN', 'EASE_OUT', 'EASE_IN_OUT']),
  duration_frames: z.number().int().min(0)
});

/**
 * Scene IR (Node in the DRG)
 * Complete semantic definition of a single atomic visual unit.
 */
const SceneIRSchema = z.strictObject({
  scene_id: z.string(),
  emotion_state: EmotionTaxonomy,
  
  // Explicit Timebase
  frame_index: z.number().int().min(0),
  start_time_ms: z.number().min(0),
  duration_frames: z.number().int().min(1),
  global_time_offset: z.number().int().min(0),
  
  // Physical Asset Resolved by AssetResolverEngine
  resolved_background_asset: z.string().optional(),
  
  // Render Hints
  motion_intensity: z.number().min(0).max(1),
  playback_rate: z.number().min(0.5).max(2.0).default(1.0),
  
  // Connection to the next node
  transition_out: TransitionIRSchema
});

/**
 * Deterministic Render Graph (DRG)
 * The closed-form IR (Intermediate Representation) of a Video.
 * Compile-time strict, ready for Remotion/FFmpeg without runtime heuristics.
 */
export const DRGModelSchema = z.strictObject({
  global_render_seed: z.string(),
  target_fps: z.number().int(),
  target_resolution: z.enum(['1920x1080', '1080x1920']),
  total_duration_frames: z.number().int().min(1),
  scenes: z.array(SceneIRSchema)
});

export type TransitionIR = z.infer<typeof TransitionIRSchema>;
export type SceneIR = z.infer<typeof SceneIRSchema>;
export type DRGModel = z.infer<typeof DRGModelSchema>;
