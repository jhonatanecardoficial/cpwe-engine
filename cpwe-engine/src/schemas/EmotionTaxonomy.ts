import { z } from 'zod';

export const EmotionTaxonomy = z.enum([
  'HIGH_TENSION',
  'CURIOUSITY_SPIKE',
  'FEAR_OF_MISSING_OUT',
  'ANALYTICAL_MODE',
  'BREAKDOWN_SEQUENCE'
]);

export type EmotionState = z.infer<typeof EmotionTaxonomy>;
