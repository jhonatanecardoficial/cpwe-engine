import { proxyActivities, ApplicationFailure } from '@temporalio/workflow';
import { CSO, CSOSchema, appendToCSO } from '../schemas/cso';
import { CompilerError } from '../schemas/CompilerErrors';
import type * as activities from '../nodes'; // We'll assume activities are exported from a central index
import { calculateVideoScore } from '../engines/QAValidator';
import { validateCrossNodeConsistency } from '../engines/ConsistencyChecker';
import { ChannelProfile, BrandVoiceProfile, VisualIdentityProfile, PublishingProfile, MonetizationProfile } from '../channel';

/**
 * Temporal proxy binding for all strict Nodes and QA engines.
 * We enforce a strict retry policy (e.g., maximum 2 retries per node) 
 * at the Temporal worker level, not within the node itself.
 */
const {
  TrendNodeActivity,
  ScriptNodeActivity,
  extractFeatures,
  fetchChannelMemory,
  VideoPackageBuilderActivity,
  // New IR Activities (Mocks/Wrappers to be created in nodes/index.ts)
  ScenePlannerActivity,
  AssetResolverActivity,
  TimelineBuilderActivity,
  DRGValidatorActivity,
  FFmpegRenderActivity
} = proxyActivities<any>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 2,
  },
});

/**
 * 🏭 THE PRODUCTION PIPELINE DAG
 * YouTubeVideoPipeline
 * 
 * Strict deterministic execution graph.
 * If any Node hallucinates or Zod fails, Temporal throws and retries up to max limits.
 */
export async function YouTubeVideoPipeline(topic: string): Promise<any> {
  // 1. Initialize the STRICT Context State Object (CSO)
  let csoState: CSO = CSOSchema.parse({ version: "1.0" });

  // 1A. Inject Channel Identity Layer (CIL) into CSO
  csoState = appendToCSO(csoState, { 
    channel_identity: {
      profile: ChannelProfile,
      voice: BrandVoiceProfile,
      visual: VisualIdentityProfile,
      publishing: PublishingProfile,
      monetization: MonetizationProfile
    }
  });

  // 1B. Fetch Channel Intelligence Memory Snapshot
  const memorySnapshot = await fetchChannelMemory('ai_automation_channel');
  csoState = appendToCSO(csoState, { channel_memory_snapshot: memorySnapshot });

  // ---------------------------------------------------------
  // NODE 1: TREND ANALYSIS
  // ---------------------------------------------------------
  const trendSignals = await TrendNodeActivity(csoState, topic);
  
  // Immutability Check: Append new signals strictly
  csoState = appendToCSO(csoState, { trend_signals: trendSignals });

  // ---------------------------------------------------------
  // NODE 2: SCRIPT GENERATION
  // ---------------------------------------------------------
  const scriptMemory = await ScriptNodeActivity(csoState);
  csoState = appendToCSO(csoState, { script_memory: scriptMemory });

  // ---------------------------------------------------------
  // HARDENING GATE 1: CROSS-NODE CONSISTENCY
  // ---------------------------------------------------------
  // Mathematical Enum checking. If Script drifted from Trend, kill execution.
  // We execute this directly because it's a synchronous pure math function, not an activity
  const consistencyResult = validateCrossNodeConsistency(csoState);
  if (consistencyResult.decision === 'STOP') {
    throw ApplicationFailure.create({
      message: `Consistency Check Failed: ${consistencyResult.broken_links.join(', ')}`,
      type: 'ConsistencyFault',
      nonRetryable: false // Retry triggers script regeneration
    });
  }

  // ---------------------------------------------------------
  // HARDENING GATE 2: PURE MATH QA SYSTEM
  // ---------------------------------------------------------
  // Step 2A: Feature Extraction (Strict JSON)
  const extractedFeatures = await extractFeatures(
    csoState.script_memory?.narrative || '', 
    csoState.script_memory?.hook || ''
  );

  // Step 2B: Deterministic Scoring Function (Local Math)
  const qaResult = calculateVideoScore(extractedFeatures);
  
  if (qaResult.decision === 'REJECT') {
    throw ApplicationFailure.create({
      message: `QA Scoring Failed. Score: ${qaResult.score}. Reasons: ${qaResult.failure_reasons.join(', ')}`,
      type: 'QualityAssuranceFault',
      nonRetryable: false // Temporal will retry the DAG block or specific node based on compensation logic
    });
  }

  // ---------------------------------------------------------
  // FINAL NODE: OUTPUT ASSEMBLY
  // ---------------------------------------------------------
  // If it survived the QA math function, it is safe to package.
  const finalVideoPackage = await VideoPackageBuilderActivity(csoState);
  
  // ---------------------------------------------------------
  // MEDIA COMPILER SYSTEM (LLVM for Video)
  // ---------------------------------------------------------
  
  // 1. Attention-Optimized Segmentation
  const abstractScenes = await ScenePlannerActivity(
    csoState.script_memory?.narrative || '', 
    30 // target FPS
  );

  // 2. High-Level Intermediate Representation (DRG) & Constraint Solving
  let drgModel;
  try {
    drgModel = await TimelineBuilderActivity.compileToDRG(
      `SEED_${Date.now()}_${topic}`, // GLOBAL_RENDER_SEED
      30, // target FPS
      abstractScenes
    );
  } catch (err: any) {
    if (err instanceof CompilerError) {
      throw ApplicationFailure.create({
        message: err.message,
        type: err.type, // e.g. ASSET_FAIL or GRAPH_FAIL
        nonRetryable: true // Compilation mathematically failed
      });
    }
    throw err;
  }

  // 3. Compile-Time Strict Validation
  await DRGValidatorActivity(drgModel);

  // 4. Lowering Pass: DRG -> Execution IR (Hardware level Memory Model)
  const executionGraph = await TimelineBuilderActivity.lowerToExecutionIR(drgModel);

  // 5. Raw FFmpeg Rendering (Runtime Executor OCO)
  // 🔴 HARD FAIL POLICY: Any issue during execution will abort the DAG. No fallback.
  const outputPath = `/tmp/render_${Date.now()}.mp4`;
  try {
    await FFmpegRenderActivity(executionGraph, outputPath);
  } catch (err: any) {
    // Determine runtime error sub-type
    const isEnvIssue = err.message.includes('ffmpeg not found');
    const isIoIssue = err.message.includes('No such file');
    
    const failType = isEnvIssue ? 'EXEC_FAIL_ENV' : (isIoIssue ? 'EXEC_FAIL_IO' : 'EXEC_FAIL_RUNTIME');

    throw ApplicationFailure.create({
      message: `Deterministic Execution Failed: ${err.message}`,
      type: failType,
      nonRetryable: true
    });
  }

  return {
    ...finalVideoPackage,
    render_output: outputPath,
    compiler_checksum: executionGraph.compiler_checksum,
    schema_version: executionGraph.schema_version
  };
}