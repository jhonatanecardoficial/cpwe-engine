import { z } from 'zod';
import { CSO, ScriptMemorySchema } from '../schemas/cso';
import { generateStrictly } from '../engines/ModelReliabilityLayer';

/**
 * Node Strict Isolation Rules - Anti-Drift Guardrails
 * Injected mandatorily to eradicate "Agent Drift" and force strict pipeline compliance.
 */
const ANTI_DRIFT_PROMPT = `
You MUST NOT infer missing context outside CSO.
FORBIDDEN ACTIONS:
- creating tasks
- requesting external data
- changing workflow structure
- suggesting infrastructure changes
- making up themes that contradict the trend_signals
`;

/**
 * 🏭 ScriptNodeActivity
 * Generates the core narrative structured strictly by Zod.
 * Receives the CSO (Context State Object) which contains the previously
 * established trend signals and audience parameters.
 */
export async function ScriptNodeActivity(cso: CSO): Promise<z.infer<typeof ScriptMemorySchema>> {
  // Hard failure if it tries to run without context
  if (!cso.trend_signals) {
    throw new Error('ScriptNode execution blocked: trend_signals missing in CSO.');
  }

  const systemPrompt = `
You are the ScriptNode in a Content Production Workflow Engine (CPWE).
Your ONLY job is to output strict JSON representing a video script based EXACTLY on the input state.
${ANTI_DRIFT_PROMPT}

CURRENT CSO STATE (Read-Only):
${JSON.stringify(cso, null, 2)}
`;

  // The user prompt is completely constrained by the state, no free text input.
  const userPrompt = `
Based on the provided CSO STATE, generate the video script.
Output ONLY a JSON object with:
- "hook" (string): the first 5 seconds.
- "narrative" (string): the main script content.
- "cta" (string): the call to action.
- "duration_estimate" (number): estimated video length in seconds.
`;

  // Safely generate using the Reliability Interceptor Layer
  const validatedScript = await generateStrictly(
    'script_generation',
    systemPrompt,
    userPrompt,
    ScriptMemorySchema
  );

  return validatedScript;
}