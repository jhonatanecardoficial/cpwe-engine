# No Engine Dump

Este documento fornece a estrutura e descrição de todo o restante do projeto, isolando e omitindo os detalhes do módulo **CPWE Engine**. A stack abrange a orquestração geral, agentes autônomos de IA e plataformas open-source complementares.

## 1. Módulos Principais (Ecossistema)

### `hermes-agent/`
Trata-se de uma infraestrutura de Agentes de IA construída em **Python** (`pyproject.toml`, `uv.lock`). 
- **Estrutura**: Possui uma gama gigantesca de subdiretórios, como `hermes_cli/`, `plugins/`, `skills/`, `tools/`, e `providers/`.
- **Arquivos-chave**: `run_agent.py`, `batch_runner.py`, e `cli.py`.
- **Propósito**: O Hermes é focado na automação de processos via IA autônoma, lidando com chamadas de LLMs, TUI (Terminal UI), rotinas e integrações (adapters).

### `openclaw/`
Repositório massivo construído como monorepo **Node.js/TypeScript** usando `pnpm` (`pnpm-workspace.yaml`).
- **Estrutura**: Subdividido em `apps/`, `packages/`, `extensions/`, `ui/`, `src/`.
- **Arquivos-chave**: Diversas documentações (`AGENTS.md`, `SECURITY.md`, `VISION.md`), e scripts de orquestração local (`openclaw.mjs`, `tsdown.config.ts`).
- **Propósito**: Módulo voltado para construção robusta de interfaces ou extensões do ecossistema que precisam interagir com LLMs e agentes de forma escalável.

### `paperclipai/`
Outro monorepo **Node.js** usando `pnpm`, gerenciando a interface central e servidores de orquestração do Paperclip.
- **Estrutura**: Subdividido em `server/`, `ui/`, `cli/`, `packages/`, e `adapter-plugin`.
- **Arquivos-chave**: `AGENTS.md`, `ROADMAP.md` e suas definições próprias de `Dockerfile`.
- **Propósito**: Componente front-end/back-end para gerenciar o ecossistema e ferramentas integradas com as capacidades de IA.

## 2. Configurações de Orquestração (Root)

Na raiz do repositório, há diversos arquivos encarregados de costurar todos esses microsserviços e ferramentas:

- **Orquestração Docker**:
  - `docker-compose.yml`: Declara e sobe todo o ecossistema (bancos, Hermes, Paperclip, OpenClaw).
  - `Dockerfile.paperclip` & `Dockerfile.openclaw`: Scripts customizados de construção de imagem que sobrepõem as configurações padrão dos submódulos.
  - `paperclip-entrypoint.sh`: Inicializador executado dentro do container para validação e setup inicial da base do Paperclip.
  - `Cofiguracao-docker-compose.md`: Documentação minuciosa de como subir o Docker Compose.

- **Utilitários SQL (Bancos e Agentes)**:
  - Vários scripts focados em inicializar dados de bancos de dados que as plataformas utilizam:
  - `configure_atlas_local.sql`, `configure_local_llm.sql`.
  - `create_hermes_master.sql`, `setup_agents.sql`, `viral_forge_setup.sql`.
  - Propósito: Migrar ou preencher o banco de dados das plataformas assim que são inicializadas na orquestração Docker.

- **Utilitários Python (Scripts Locais)**:
  - `create_markdown_bundle.py` / `restore_bundle.py`: Rotinas de backup/empacotamento de contextos Markdown.
  - `generate_emergency_sql.py`: Ferramenta para tratar emergências de dados.

## 3. Diretórios Complementares

- **`.agent/` e `docs/`**: Configurações relativas a comportamentos globais de agentes (o AG Kit), skills documentadas e dumps.
- **`prompts/`**: Centralização de prompts refinados possivelmente injetados nos sistemas de IA do Hermes ou do CPWE.
- **`scripts/`**: Scripts de automação Bash/Python soltos que facilitam a vida dos mantenedores (deploy, limpezas, setup de ambiente).