import { z } from 'zod';
import { ChannelMemorySnapshotSchema } from '../engines/ChannelMemoryLayer';

/**
 * 🚨 STRICT FIELD LOCK (CSO)
 * This is the ultimate Execution Contract for the CPWE DAG.
 * It is IMMUTABLE and APPEND-ONLY.
 * No node can infer or invent missing context outside of these strict schemas.
 */

export const TrendSignalsSchema = z.strictObject({
  topic_cluster: z.string(),
  audience_intent: z.enum(['automation_income', 'educational', 'entertainment', 'storytelling']),
  content_style: z.enum(['tutorial', 'case_study', 'listicle', 'vlog']),
  emotional_driver: z.enum(['financial_leverage', 'curiosity', 'fear_of_missing_out', 'inspiration']),
  source: z.string().optional(),
  values: z.array(
    z.strictObject({
      keyword: z.string(),
      volume: z.number().optional(),
    })
  ).optional()
});

export const AudienceProfileSchema = z.strictObject({
  segment: z.string(),
  confidence: z.number().min(0).max(1)
});

export const ScriptMemorySchema = z.strictObject({
  hook: z.string().optional(),
  narrative: z.string().optional(),
  cta: z.string().optional(),
  duration_estimate: z.number().optional()
});

/**
 * The Context State Object (CSO) Schema
 * Versioned, Strict, and Immutable across the Workflow execution.
 */
export const CSOSchema = z.strictObject({
  version: z.literal("1.0"),
  channel_memory_snapshot: ChannelMemorySnapshotSchema.optional(),
  trend_signals: TrendSignalsSchema.optional(),
  audience_profile: AudienceProfileSchema.optional(),
  script_memory: ScriptMemorySchema.optional(),
});

export type CSO = z.infer<typeof CSOSchema>;

/**
 * Helper to enforce append-only state mutation between Temporal activities.
 * It throws if a node attempts to mutate an existing field.
 */
export function appendToCSO(currentState: CSO, nextStatePayload: Partial<CSO>): CSO {
  const newState = { ...currentState };
  
  for (const [key, value] of Object.entries(nextStatePayload)) {
    if (key in currentState && currentState[key as keyof CSO] !== undefined) {
      throw new Error(`CSO Immutability Violation: Cannot overwrite existing field '${key}'. Append-only rule enforced.`);
    }
    // @ts-ignore
    newState[key as keyof CSO] = value;
  }
  
  // Enforce strict schema validation before returning
  return CSOSchema.parse(newState);
}