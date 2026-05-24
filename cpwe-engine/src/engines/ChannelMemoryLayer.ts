import { z } from 'zod';

export const ChannelMemorySnapshotSchema = z.strictObject({
  used_hooks: z.array(z.string()),
  used_angles: z.array(z.string()),
  thumbnail_patterns: z.array(z.string()),
  topic_saturation: z.record(z.string(), z.number().min(0).max(1)),
  audience_fatigue_level: z.number().min(0).max(1)
});

export type ChannelMemorySnapshot = z.infer<typeof ChannelMemorySnapshotSchema>;

/**
 * 📚 Channel Intelligence Memory Layer
 * 
 * Prevents audience fatigue by tracking historical pipeline outputs.
 * This ensures that a highly successful hook or narrative angle isn't 
 * repeatedly spammed until it destroys the channel's CTR.
 */
export async function fetchChannelMemory(channelClass: string): Promise<ChannelMemorySnapshot> {
  // In a real production system, this queries Postgres/Redis for the channel's history
  console.log(`[MemoryLayer] Fetching historical saturation for channel class: ${channelClass}`);
  
  // Mocking the DB fetch
  return ChannelMemorySnapshotSchema.parse({
    used_hooks: [
      "Stop doing X, do Y instead",
      "The secret to X nobody tells you"
    ],
    used_angles: [
      "Rags to riches",
      "Exposing the industry"
    ],
    thumbnail_patterns: [
      "Red arrow pointing at blurry screen",
      "Surprised face with glowing background"
    ],
    topic_saturation: {
      "AI_AGENTS": 0.85, // High saturation, nodes should be constrained
      "AUTOMATION": 0.40
    },
    audience_fatigue_level: 0.65 // General fatigue indicator
  });
}

/**
 * Helper to convert the memory snapshot into explicit negative constraints 
 * to be injected into the LLM System Prompts.
 */
export function buildNegativeConstraintsFromMemory(memory: ChannelMemorySnapshot): string {
  let constraints = `
CRITICAL NEGATIVE CONSTRAINTS (Channel Memory):
You MUST NOT use the following hooks, as they are fatigued:
${memory.used_hooks.map((h: string) => `- "${h}"`).join('\n')}

You MUST NOT use the following narrative angles:
${memory.used_angles.map((a: string) => `- "${a}"`).join('\n')}
`;

  // Apply hard limits if topic is saturated
  for (const [topic, saturation] of Object.entries(memory.topic_saturation) as [string, number][]) {
    if (saturation > 0.8) {
      constraints += `\nWARNING: Topic '${topic}' is at ${saturation * 100}% saturation. You MUST pivot to extreme sub-niches or contrarian views. Do not generate generic content for this topic.`;
    }
  }

  return constraints;
}