# 🚀 CPWE Engine (Content Production Workflow Engine) - Architectural Dump

Este documento reflete a versão **Final e Refatorada** do motor de automação (isolado do ecossistema legado), detalhando a sua topologia, os padrões de resiliência e a mecânica de execução do Grafo Direcionado Acíclico (DAG).

## 1. Visão Arquitetural Macro

O **CPWE Engine** não é um mero script sequencial. Ele é construído sobre o padrão de **Sistemas Reativos Orientados a Eventos**, usando o [Temporal.io](https://temporal.io/) como plano de controle (Control Plane). 

Seu objetivo é **erradicar a alucinação (Agent Drift)** e garantir que a produção de conteúdo ocorra de forma determinística, mesmo que modelos da OpenAI falhem temporariamente ou o servidor sofra um crash.

### 📐 Topologia de Camadas (Layered Design)
A arquitetura segue 4 pilares rigorosos:
1. **Orchestration Layer (Temporal)**: Gerencia o ciclo de vida, as retentativas (retries) com backoff exponencial e o estado imutável.
2. **Production Hardening Layer (Engines)**: Camada de interceptação que aplica cálculos matemáticos e verificação estrita antes de passar de um nó para o outro.
3. **Execution Layer (Nodes)**: Atividades puras de negócio (buscar tendência, gerar roteiro, montar pacote).
4. **Data Contract Layer (Schemas)**: Contratos duros definidos em `Zod` (CSO) que garantem a tipagem forte de entrada e saída.

---

## 2. Mapa do Código-Fonte (`src/`)

```text
cpwe-engine/src/
├── schemas/
│   └── cso.ts                  # Context State Object (CSO). Contrato estrito e imutável do sistema.
├── workflows/
│   └── YouTubeVideoPipeline.ts # DAG Principal. O cérebro que interliga os nós e define os Gates de Segurança.
├── nodes/
│   ├── index.ts                # Entrypoint de exportação das Atividades.
│   ├── ScriptNode.ts           # Nó responsável por gerar o hook, narrativa e call_to_action (Zod-enforced).
│   ├── TrendNode.ts            # Nó responsável por analisar sinais de audiência e intenção.
│   └── VideoPackageBuilder.ts  # Nó final determinístico (Não usa LLM). Apenas compila o output aprovado.
├── engines/
│   ├── ChannelMemoryLayer.ts   # Memória Histórica: Evita fadiga de audiência penalizando hooks e ângulos repetidos.
│   ├── ConsistencyChecker.ts   # Segurança: Valida se o Nó 2 (Script) respeitou o que foi pedido no Nó 1 (Trend).
│   ├── FeatureExtractor.ts     # QA: Extrai features do texto bruto convertendo-as em matrizes de probabilidade.
│   ├── GoldenBenchmarkSuite.ts # QA: Thresholds matemáticos parametrizados pelo nicho do canal.
│   ├── ModelReliabilityLayer.ts# Resiliência: Monitora a taxa de falha dos modelos LLM e faz "Failover" automático.
│   └── QAValidator.ts          # QA: Pure Math Scoring Engine. Decide se o vídeo passa ou é rejeitado.
├── client-trigger.ts           # CLI / Client. Injeta o sinal inicial na fila do Temporal.
└── worker.ts                   # O "Músculo" físico. Processo Node.js que escuta a fila do Temporal e executa a DAG.
```

---

## 3. O Padrão CSO (Context State Object)

No coração do motor existe a regra da **Imutabilidade e Append-Only**:
- Nenhuma atividade (Nó) pode apagar ou sobreescrever dados do estado anterior.
- Todos os dados transitam através do `CSO` (Tipificado via `Zod`).
- Se um modelo (LLM) inventar uma chave que não existe no Schema, a `ModelReliabilityLayer` intercepta, lança um erro, e o Temporal repete a tarefa.

---

## 4. O Fluxo de Execução (O DAG de Produção)

A execução do `YouTubeVideoPipeline.ts` segue estritamente as etapas abaixo:

1. **Init**: Criação do CSO em branco (Versão 1.0).
2. **Contextualização**: O motor busca o `ChannelMemorySnapshot` para saber o que **NÃO** fazer (evitar fadiga de audiência).
3. **Nó 1 (Trend)**: Gera a ideia e a intenção de audiência. O CSO é atualizado.
4. **Nó 2 (Script)**: Gera o roteiro completo guiado restritamente pelo `Anti-Drift Prompt`.
5. **Hardening Gate 1 (Consistency)**: Verificação **Sem LLM**. Validação direta de Enums. Se o roteiro divergir da tendência, lança exceção `ConsistencyFault`.
6. **Hardening Gate 2 (Math QA)**:
   - Extrai features vetoriais do roteiro (ex: Densidade de narrativa, força do Hook nos 5s).
   - O `QAValidator` aplica pesos de Álgebra Linear.
   - Se a nota (score) for menor que o Threshold (ex: 0.82 para canais de Automação), o roteiro é **REJEITADO**, e o Temporal pode ser configurado para reiniciar o nó de Script.
7. **Nó Final (Assembler)**: Monta e assina digitalmente o pacote de vídeo (Gera um Hash de Auditoria comprovando que passou pela Malha de QA).

---

## 5. Resiliência e "Failover" Automático

O arquivo `ModelReliabilityLayer.ts` atua como um Disjuntor (Circuit Breaker).
- Ele monitora cada "Rota de Capacidade" (ex: Rota de Geração de Roteiro vs Rota de Tendência).
- Se a API da OpenAI (ou LiteLLM) falhar 3 vezes na quebra do Schema JSON (`ZodError`), a camada classifica o modelo primário como **DEGRADED**.
- Imediatamente, ele altera o tráfego para um **Modelo de Fallback** (ex: trocando de `gpt-4o` para um modelo menor, porém mais estável, ou alternando provedores configurados no `litellm_config.yaml`).