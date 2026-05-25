/**
 * 🚨 Media Compiler Formal Failure Semantics
 * This taxonomy guarantees granular observability and precise rollback strategies.
 */
export enum CompilerErrorType {
  /**
   * I/O failure during compilation. The AssetResolver failed to map a physical file.
   * Strategy: Compile-time replacement ONLY IF fallback is explicitly declared in DRG.
   */
  ASSET_FAIL = 'ASSET_FAIL',

  /**
   * Mathematical failure. The ConstraintSolver reached INFEASIBLE or UNBOUNDED state.
   * Strategy: Abort Compilation. Graph is theoretically impossible.
   */
  GRAPH_FAIL = 'GRAPH_FAIL',

  /**
   * Deterministic execution failure. Input is valid, but the physical file is missing or corrupted.
   * Strategy: Hard stop. Fix data.
   */
  EXEC_FAIL_IO = 'EXEC_FAIL_IO',

  /**
   * Runtime crash. FFmpeg/Remotion crashed due to codec, GPU, or rendering layer limits.
   * Strategy: Hard stop. Investigate execution environment.
   */
  EXEC_FAIL_RUNTIME = 'EXEC_FAIL_RUNTIME',

  /**
   * Non-deterministic environment failure. Missing dependencies, wrong FFmpeg version, memory limits.
   * Strategy: Hard stop. DevOps intervention required.
   */
  EXEC_FAIL_ENV = 'EXEC_FAIL_ENV'
}

export class CompilerError extends Error {
  constructor(public type: CompilerErrorType, message: string) {
    super(`[${type}] ${message}`);
    this.name = 'CompilerError';
  }
}
