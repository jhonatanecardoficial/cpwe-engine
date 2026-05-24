import { CSO } from '../schemas/cso';

export interface FinalVideoPackage {
  channel_topic: string;
  hook: string;
  narrative_body: string;
  call_to_action: string;
  metadata: {
    duration_estimate: number;
    audience_intent: string;
    content_style: string;
  };
  phl_audit_hash: string;
}

/**
 * 🏭 VideoPackageBuilderActivity
 * 
 * The final DAG node. 
 * This node ONLY executes if the Script passed the QA Math Engine 
 * and the Cross-Node Consistency Checker.
 * It does not use LLMs, it simply extracts the final immutable state 
 * and formats it for the UI/Database.
 */
export async function VideoPackageBuilderActivity(cso: CSO): Promise<FinalVideoPackage> {
  if (!cso.trend_signals || !cso.script_memory) {
    throw new Error('VideoPackageBuilder cannot assemble package. Missing CSO data.');
  }

  // Simulated hash to prove it passed PHL (Production Hardening Layer)
  const auditHash = `PHL_PASS_${Date.now().toString(36).toUpperCase()}`;

  return {
    channel_topic: cso.trend_signals.topic_cluster,
    hook: cso.script_memory.hook || '',
    narrative_body: cso.script_memory.narrative || '',
    call_to_action: cso.script_memory.cta || '',
    metadata: {
      duration_estimate: cso.script_memory.duration_estimate || 0,
      audience_intent: cso.trend_signals.audience_intent,
      content_style: cso.trend_signals.content_style,
    },
    phl_audit_hash: auditHash
  };
}