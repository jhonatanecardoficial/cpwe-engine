import { Connection, Client } from '@temporalio/client';

async function run() {
  const topic = process.argv[2] || "Como criar agentes de IA de forma deterministica";
  
  console.log(`[TRIGGER] Iniciando workflow para o tópico: "${topic}"...`);

  // Conectar ao servidor local do Temporal
  const connection = await Connection.connect({ address: 'temporal:7233' });
  const client = new Client({ connection });

  const workflowId = `cpwe-cli-job-${Date.now()}`;

  // Iniciar o workflow de produção
  const handle = await client.workflow.start('YouTubeVideoPipeline', {
    taskQueue: 'cpwe-production-queue',
    workflowId,
    args: [topic],
  });

  console.log(`[TRIGGER] ✅ Job escalonado no Temporal! WorkflowID: ${workflowId}`);
  console.log(`[TRIGGER] 👁️  Acompanhe visualmente em: http://localhost:8233/namespaces/default/workflows/${workflowId}`);
  console.log(`[TRIGGER] Aguardando a finalização da DAG (Isso pode demorar alguns minutos dependendo da LLM)...`);

  // Aguardar a finalização e capturar o resultado (FinalVideoPackage)
  const result = await handle.result();
  
  console.log('\n======================================================');
  console.log('🎉 SCRIPT FINAL GERADO PELO MOTOR E APROVADO PELO QA 🎉');
  console.log('======================================================\n');
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(0);
}

run().catch((err) => {
  console.error('[TRIGGER] ❌ Erro ao escalonar o job no Temporal:', err);
  process.exit(1);
});