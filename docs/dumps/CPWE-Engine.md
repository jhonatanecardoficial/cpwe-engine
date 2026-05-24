# CPWE Engine Dump

Este documento detalha o submódulo **CPWE Engine** (Content Production Workflow Engine), descrevendo sua estrutura, tecnologias e responsabilidades.

## Visão Geral

O **CPWE Engine** é um motor de workflows de produção de conteúdo escrito em TypeScript e baseado no [Temporal.io](https://temporal.io/). Ele utiliza a API da OpenAI para geração e manipulação de texto, além do `zod` para validação de esquemas de dados.

O objetivo do módulo é gerenciar tarefas assíncronas complexas e resilientes, dividindo a produção em "Nodes" (Nós) e orquestrando o fluxo de trabalho (Pipelines).

## Estrutura do Diretório (`cpwe-engine/`)

```text
cpwe-engine/
├── Dockerfile                  # Configuração de build Docker para o CPWE.
├── litellm_config.yaml         # Configurações do proxy de modelos (LiteLLM).
├── package.json                # Dependências Node.js (Temporal, OpenAI, Zod, TypeScript).
├── tsconfig.json               # Configurações de compilação TypeScript.
├── logs/                       # Diretório gerado para armazenar logs locais do worker.
└── src/                        # Código-fonte principal da aplicação
    ├── client-trigger.ts       # Script cliente para invocar e testar os workflows do Temporal.
    ├── worker.ts               # Worker do Temporal que escuta filas e executa atividades/workflows.
    ├── engines/                # Camadas e ferramentas de inteligência/processamento de conteúdo.
    │   ├── ChannelMemoryLayer.ts
    │   ├── ConsistencyChecker.ts
    │   ├── FeatureExtractor.ts
    │   ├── GoldenBenchmarkSuite.ts
    │   ├── ModelReliabilityLayer.ts
    │   └── QAValidator.ts
    ├── nodes/                  # Nós de atividades granulares usados pelo fluxo.
    │   ├── ScriptNode.ts       # Tratamento/Geração de scripts.
    │   ├── TrendNode.ts        # Pesquisa/Análise de tendências.
    │   ├── VideoPackageBuilder.ts # Construção do pacote de vídeo final.
    │   └── index.ts            # Exportação das atividades.
    └── workflows/              # Definição dos pipelines de execução orquestrados.
        └── YouTubeVideoPipeline.ts # Workflow principal para criação de vídeos para o YouTube.
```

## Bibliotecas e Tecnologias-Chave

- **Temporal (`@temporalio/*`)**: Controla o ciclo de vida, retentativas e o estado dos workflows.
- **OpenAI**: Para chamadas de inteligência artificial.
- **Zod**: Garantia de tipagem e validação dos retornos de IA.
- **TypeScript & Node.js**: Stack principal da lógica.

## Resumo dos Componentes

1. **Workflows**: O fluxo `YouTubeVideoPipeline` amarra as chamadas aos "Nodes". Ele garante que, caso o container caia, o workflow possa ser retomado exatamente de onde parou.
2. **Nodes**: Representam passos individuais do fluxo (como buscar a tendência ou montar o vídeo). Eles encapsulam lógica de negócio específica.
3. **Engines**: Fornecem as "engrenagens" de IA para as tarefas, focando em consistência, retenção de contexto, QA (Quality Assurance) e extração de características.
4. **Worker / Client**: O `worker.ts` registra as atividades e o workflow na fila do Temporal, enquanto o `client-trigger.ts` envia uma requisição para disparar uma nova pipeline de teste.