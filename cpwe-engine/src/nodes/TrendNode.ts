import { z } from 'zod';
import { CSO, TrendSignalsSchema } from '../schemas/cso';
import { generateStrictly } from '../engines/ModelReliabilityLayer';

/**
 * Node Strict Isolation Rules - Anti-Drift Guardrails
 * Injected mandatorily into EVERY node's system prompt.
 */
const ANTI_DRIFT_PROMPT = `
You MUST NOT infer missing context outside CSO.
FORBIDDEN ACTIONS:
- creating tasks
- requesting external data
- changing workflow structure
- suggesting infrastructure changes
`;

export async function TrendNodeActivity(cso: CSO, rawTopic: string): Promise<z.infer<typeof TrendSignalsSchema>> {
  const systemPrompt = `
You are the TrendNode in a Content Production Workflow Engine (CPWE).
Your job is to strictly output JSON matching the required schema based on the input topic.
${ANTI_DRIFT_PROMPT}

CURRENT CSO STATE (Read-Only):
${JSON.stringify(cso, null, 2)}
`;

  const userPrompt = `Generate a trend signal analysis for the topic: "${rawTopic}".
Output ONLY a JSON object with:
- "topic_cluster" (string): the main cluster this topic belongs to.
- "audience_intent" (string): MUST be exactly one of: "automation_income", "educational", "entertainment", "storytelling".
- "content_style" (string): MUST be exactly one of: "tutorial", "case_study", "listicle", "vlog".
- "emotional_driver" (string): MUST be exactly one of: "financial_leverage", "curiosity", "fear_of_missing_out", "inspiration".
- "source" (string, optional): source of the trend.
- "values" (array of objects, optional): containing "keyword" (string) and "volume" (number).`;

  // Safely generate using the Reliability Interceptor Layer
  const validatedTrend = await generateStrictly(
    'trend_analysis',
    systemPrompt,
    userPrompt,
    TrendSignalsSchema
  );

  return validatedTrend;
}