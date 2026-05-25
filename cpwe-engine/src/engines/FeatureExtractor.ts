import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: process.env.LITELLM_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || process.env.LITELLM_API_KEY || 'sk-litellm-dummy'
});

/**
 * STEP 1 of QA: The Feature Extractor
 * This node DOES NOT make decisions. It ONLY extracts mathematical features
 * from the unstructured text to be used in the Pure Math Scoring Engine.
 */
export const ExtractedFeaturesSchema = z.strictObject({
  hook_retention_5s: z.number().min(0).max(1),
  avg_view_velocity: z.number().min(0).max(1),
  title_ctr_match: z.number().min(0).max(1),
  narrative_density: z.number().min(0).max(1)
});

export type ExtractedFeatures = z.infer<typeof ExtractedFeaturesSchema>;

export async function extractFeatures(scriptText: string, title: string): Promise<ExtractedFeatures> {
  const systemPrompt = `
You are the FeatureExtractor in the QA System.
Your ONLY job is to analyze the provided script and title, and output a STRICT JSON containing exact float values between 0.0 and 1.0 for the requested features.
Do NOT output opinions, do NOT make decisions. 
Calculate the estimated probability/strength of each metric based on standard YouTube pacing and hook structures.

Output ONLY a JSON object with EXACTLY these keys:
- "hook_retention_5s" (number from 0.0 to 1.0)
- "avg_view_velocity" (number from 0.0 to 1.0)
- "title_ctr_match" (number from 0.0 to 1.0)
- "narrative_density" (number from 0.0 to 1.0)
`;

  const userPrompt = `Title: "${title}"\n\nScript:\n${scriptText}`;

  // Use a capable model for extraction
  const response = await openai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Near deterministic
  });

  const rawJson = response.choices[0].message.content;
  if (!rawJson) {
    throw new Error('FeatureExtractor failed to return data.');
  }

  try {
    const parsed = JSON.parse(rawJson);
    return ExtractedFeaturesSchema.parse(parsed);
  } catch (error) {
    throw new Error(`FeatureExtractor strict validation failed: ${error}`);
  }
}