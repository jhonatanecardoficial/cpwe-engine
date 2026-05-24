# Architectural Decision Records (ADRs) & Trade-off Analysis
## Sistema: CPWE Engine (Content Production Workflow Engine)

Este documento foi gerado através da skill de Orquestração e Arquitetura (`coordinator-mode` + `architecture`), refletindo as decisões sistêmicas (O *Por que* as coisas foram feitas assim).

---

## 🏗️ Princípio de Design Core
**"Determinismo acima de Criatividade Irrestrita"**

No contexto de agentes autônomos gerando conteúdo em lote para YouTube, o maior risco sistêmico é a degradação de qualidade ("Agent Drift" ou Alucinação Semântica) ao longo de execuções longas. A arquitetura foi concebida puramente para combater este vetor de risco.

---

## 📜 ADR 001: Adoção do Temporal.io para Orquestração
**Contexto**: Pipelines de geração de conteúdo por LLM são operações de altíssima latência (timeouts, rate limits, indisponibilidade do provedor).
**Decisão**: Utilizar o `Temporal.io` ao invés de simples chamadas Async/Await ou filas Redis comuns.
**Trade-offs (Prós)**:
- Tolerância a falhas nativa e Retries transparentes.
- O histórico do Grafo (DAG) é persistido. Se o container for reiniciado no meio da geração de um roteiro, ele retoma exatamente de onde parou.
**Trade-offs (Contras)**:
- Alta complexidade operacional (Exige um cluster Temporal rodando na infraestrutura).
- Necessidade de separar o código fisicamente em Workers e Workflows proxy.

---

## 📜 ADR 002: Model Reliability Layer (Failover de Modelos)
**Contexto**: Modelos LLM (via OpenAI/OpenRouter) podem sofrer degradação silenciosa, passando a gerar JSONs malformados ou fugindo do escopo estrito.
**Decisão**: A `ModelReliabilityLayer` intercepta toda chamada LLM e acopla a resposta ao `Zod`. Se um modelo atingir 3 falhas seguidas (`ZodError`), ele sofre um **failover automático** para um modelo menor/backup.
**Consequências**:
- O fluxo nunca quebra completamente por erro de parse.
- Reduz o custo quando o modelo primário está instável, chaveando para um fallback mais barato.

---

## 📜 ADR 003: Avaliação Pura Matemática de QA (Sem LLM como Juiz)
**Contexto**: Frameworks tradicionais de agentes usam um "LLM Evaluator" para criticar a saída de outro LLM (ex: "Analise se este roteiro está bom"). Isso introduz viés, alta variação de notas e custo dobrado de tokens.
**Decisão**: O `QAValidator` usa Álgebra Linear. O LLM atua APENAS como `FeatureExtractor` para abstrair números puros (ex: densidade entre 0.0 e 1.0). A nota final e a decisão de Pass/Reject são calculadas por Álgebra, com base no *Golden Benchmark Suite*.
**Consequências**:
- O sistema é 100% testável matematicamente.
- O Threshold de aprovação pode ser ajustado com precisão métrica.
- Requer engenharia de features complexa, o que aumenta a dificuldade de inclusão de novas métricas de validação.

---

## 📜 ADR 004: CSO (Context State Object) Imutável e Append-Only
**Contexto**: Pipelines profundas perdem o contexto se os nós alterarem o estado livremente.
**Decisão**: Implementado o padrão `append-only` protegido por tipagem Zod estrita na camada `cso.ts`.
**Consequências**:
- Se a camada de Script tentar sobrescrever o Cluster de Tópicos definido pela camada de Trend, o TypeScript/JavaScript lançará erro em runtime, acionando o Temporal para tratar a violação.
- Garante total auditabilidade de quem fez o que durante o fluxo.