import { z } from 'zod';

/**
 * 💻 Execution IR (Frame-Addressable Memory Model)
 * This is the FINAL, rigidly canonicalized graph that goes to the Executors.
 * 
 * Rules:
 * - Purely declarative Memory Layout.
 * - Frame[t] strictly addressable.
 * - NO FFmpeg commands/filters strings here. Pure state data only.
 */

export const TransformStateSchema = z.strictObject({
  playback_rate: z.number().min(0.5).max(2.0),
  scale: z.number().min(1.0).default(1.0)
});

export const ExecutionIRNodeSchema = z.strictObject({
  asset_pointer: z.string(), // Absolute physical path
  start_ms: z.number().min(0), // Absolute timeline start
  duration_frames: z.number().int().min(1), // Absolute duration
  render_layer: z.number().int().min(0), // 0 = Background, 1 = B-roll, 2 = Overlay
  opacity_state: z.number().min(0.0).max(1.0),
  transform_state: TransformStateSchema
});

export const ExecutionIRSchema = z.strictObject({
  compiler_checksum: z.string(), // SHA-256 Hash of the Execution Graph
  schema_version: z.string(),
  total_duration_frames: z.number().int(),
  target_fps: z.number().int(),
  target_resolution: z.enum(['1920x1080', '1080x1920']),
  memory_layout: z.array(ExecutionIRNodeSchema)
});

export type ExecutionIRNode = z.infer<typeof ExecutionIRNodeSchema>;
export type ExecutionIR = z.infer<typeof ExecutionIRSchema>;
