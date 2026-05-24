# 🚀 CPWE Engine (Content Production Workflow Engine)

Este repositório é focado exclusivamente no **CPWE Engine**. 

## 🎯 O que é o CPWE?

A **CPWE** é um motor de automação assíncrona robusto escrito em **TypeScript** e baseado no ecossistema do [Temporal.io](https://temporal.io/). 

Seu principal objetivo é orquestrar a **produção de pacotes e roteiros para vídeos no YouTube** de forma descentralizada, determinística e resiliente. O sistema processa tudo usando grafos direcionados (DAGs), inteligência artificial (OpenAI via LiteLLM) e garantias estruturais (Zod).

## 🏗️ Estrutura e Arquitetura

O coração do projeto está dividido nos seguintes componentes lógicos:

- 📂 **`cpwe-engine/`**: O diretório raiz do ecossistema contendo as dependências e o ponto de entrada da aplicação.
  - 🧠 **`src/engines/`**: Camadas de processamento inteligente, QA, validações cruzadas e extrações (ex: `QAValidator.ts`).
  - 🧩 **`src/nodes/`**: Nós executores de atividades específicas na pipeline (ex: `TrendNode.ts`, `ScriptNode.ts`).
  - 🔄 **`src/workflows/`**: As definições de Pipelines que orquestram os nós e retentativas (ex: `YouTubeVideoPipeline.ts`).
- 📂 **`docs/dumps/`**: Contém arquivos Markdown exportados que detalham profundamente o mapeamento técnico do projeto.

## 🛠️ Tecnologias Principais

1. **Temporal.io** - Orquestração de workflows, timeouts, retries e persistência de estado.
2. **OpenAI API** - Base da inteligência por trás dos `nodes` de texto.
3. **Zod** - Validação dura (Schema Validation) dos dados transitados entre os passos.
4. **TypeScript** - Segurança de tipos para todo o backend Node.js.

## 🚀 Como Executar Localmente

*(Adicione os passos exatos de instação e execução da build do Node aqui)*