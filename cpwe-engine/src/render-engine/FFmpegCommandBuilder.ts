import { ExecutionIR } from '../schemas/ExecutionIR';

/**
 * 🛠️ FFmpeg Command Builder (Execution Runtime Layer)
 * RULE: THIS IS AN EXECUTOR ONLY. NO LOGIC. NO FALLBACKS.
 * 
 * Maps the declarative ExecutionIR Memory Layout 1:1 into FFmpeg arguments.
 * It DOES NOT decide playback rates, fallback assets, or correct logic.
 */
export class FFmpegCommandBuilder {
  public static buildFromExecutionIR(executionGraph: ExecutionIR, outputPath: string): string {
    let command = `ffmpeg -y `;
    let filterComplex = `-filter_complex "`;
    
    // 1. Blindly map physical assets (Memory Pointer)
    executionGraph.memory_layout.forEach((node) => {
      command += `-i "${node.asset_pointer}" `;
    });

    // 2. Blindly construct mathematical filters purely derived from declarative TransformState
    executionGraph.memory_layout.forEach((node, index) => {
      const pRate = node.transform_state.playback_rate;
      // 1:1 mapping of declarative state to ffmpeg filter
      filterComplex += `[${index}:v]setpts=${1 / pRate}*PTS[v${index}]; `;
    });

    // 3. Blindly map streams to output
    executionGraph.memory_layout.forEach((node, index) => {
      filterComplex += `[v${index}]`;
    });
    
    filterComplex += `concat=n=${executionGraph.memory_layout.length}:v=1:a=0[outv]" `;
    
    command += filterComplex;
    command += `-map "[outv]" -c:v libx264 -preset fast -crf 22 -r ${executionGraph.target_fps} -s ${executionGraph.target_resolution.replace('x', ':')} "${outputPath}"`;

    return command;
  }
}
