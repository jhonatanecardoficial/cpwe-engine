import OpenAI from 'openai';
import { z, ZodType } from 'zod';

const openai = new OpenAI({
  baseURL: process.env.LITELLM_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.LITELLM_API_KEY || 'sk-litellm-dummy'
});

interface ModelStats {
  schema_failures: number;
  total_calls: number;
  avg_latency_ms: number;
  is_degraded: boolean;
}

/**
 * 🛡️ Model Reliability Layer
 * 
 * Tracks Zod schema validation failures per capability route.
 * If a model starts hallucinating structurally and breaks the DAG frequently,
 * this layer automatically flags it as degraded and overrides the routing 
 * to force a fallback at the LiteLLM level.
 */
class ReliabilityMonitor {
  private stats: Map<string, ModelStats> = new Map();
  private readonly FAILURE_THRESHOLD = 3; // Demote after 3 schema breaks
  
  public getStats(capabilityRoute: string): ModelStats {
    if (!this.stats.has(capabilityRoute)) {
      this.stats.set(capabilityRoute, {
        schema_failures: 0,
        total_calls: 0,
        avg_latency_ms: 0,
        is_degraded: false
      });
    }
    return this.stats.get(capabilityRoute)!;
  }

  public recordSuccess(capabilityRoute: string, latencyMs: number) {
    const stat = this.getStats(capabilityRoute);
    stat.total_calls++;
    stat.avg_latency_ms = stat.total_calls === 1 ? latencyMs : (stat.avg_latency_ms + latencyMs) / 2;
    
    // Recovery mechanism: If it was degraded but starts succeeding (e.g. human intervention)
    if (stat.is_degraded && stat.schema_failures > 0) {
      stat.schema_failures--;
      if (stat.schema_failures === 0) stat.is_degraded = false;
    }
  }

  public recordSchemaFailure(capabilityRoute: string) {
    const stat = this.getStats(capabilityRoute);
    stat.total_calls++;
    stat.schema_failures++;
    
    if (stat.schema_failures >= this.FAILURE_THRESHOLD) {
      stat.is_degraded = true;
      console.warn(`[RELIABILITY] 🔴 Model Capability Route '${capabilityRoute}' is DEGRADED. Forcing failover.`);
    }
  }
}

export const modelReliabilityMonitor = new ReliabilityMonitor();

/**
 * Safe Generator Wrapper
 * All Nodes MUST use this instead of raw OpenAI calls.
 * It enforces Zod and tracks the statistical reliability of the underlying models.
 */
export async function generateStrictly<T>(
  capabilityRoute: string,
  systemPrompt: string,
  userPrompt: string,
  schema: ZodType<T>
): Promise<T> {
  const stat = modelReliabilityMonitor.getStats(capabilityRoute);
  
  // If the model is degraded, we can append a custom header to force LiteLLM to use the fallback
  // Alternatively, we just use a different alias string handled in litellm_config.yaml
  const effectiveModel = stat.is_degraded ? `${capabilityRoute}_fallback` : capabilityRoute;

  // MAP VIRTUAL ROUTES TO OPENROUTER MODELS DIRECTLY
  const modelMap: Record<string, string> = {
    'trend_analysis': 'openai/gpt-4o',
    'trend_analysis_fallback': 'openai/gpt-4o-mini',
    'video_script': 'openai/gpt-4o',
    'video_script_fallback': 'openai/gpt-4o-mini'
  };
  const openRouterModel = modelMap[effectiveModel] || 'openai/gpt-4o';

  const startTime = Date.now();
  
  try {
    const response = await openai.chat.completions.create({
      model: openRouterModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Always deterministic
    });

    const rawJson = response.choices[0].message.content;
    if (!rawJson) throw new Error('Empty response from model.');

    // Zod Validation Barrier
    const parsed = JSON.parse(rawJson);
    const validatedData = schema.parse(parsed);

    // If it survives Zod, record success
    modelReliabilityMonitor.recordSuccess(capabilityRoute, Date.now() - startTime);
    
    return validatedData;

  } catch (error) {
    // If it's a Zod Error, penalize the model
    if (error instanceof z.ZodError || (error instanceof Error && error.message.includes('Unexpected token'))) {
      modelReliabilityMonitor.recordSchemaFailure(capabilityRoute);
    }
    
    throw new Error(`Strict Generation Failed for route '${capabilityRoute}': ${error}`);
  }
}