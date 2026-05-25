import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './nodes';
import { resolve } from 'path';

/**
 * 👷 CPWE Temporal Worker
 * 
 * The physical execution shell that listens to the Temporal Cluster 
 * and processes the Production Hardening Layer nodes.
 */
async function run() {
  // Step 1: Initialize the Worker connecting to local Temporal (temporal:7233)
  // Temporal takes a few seconds to boot, so we retry connection.
  let connection;
  for (let i = 0; i < 10; i++) {
    try {
      connection = await NativeConnection.connect({ address: 'localhost:7233' });
      break;
    } catch (err) {
      console.log('[CPWE] Waiting for Temporal to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  if (!connection) throw new Error('Could not connect to Temporal cluster.');
  
  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('./workflows/YouTubeVideoPipeline'),
    activities,
    taskQueue: 'cpwe-production-queue',
  });

  console.log('[CPWE] Worker initialized. Listening to task queue: cpwe-production-queue');
  
  // Step 2: Start processing DAGs
  await worker.run();
}

run().catch((err) => {
  console.error('[CPWE] Fatal Worker Error:', err);
  // KEEP CONTAINER ALIVE FOR DEBUGGING
  setInterval(() => {
    console.log('[DEBUG] Container kept alive after crash. Check logs above.');
  }, 30000);
});