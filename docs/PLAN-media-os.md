# PLAN: Media Operating System (CGIS + CIL)

## 1. Visão Geral
Transformar o CPWE de uma "fábrica de vídeos" em um **Media Operating System**, implementando um ciclo de feedback real (analytics) e uma identidade de canal persistente. O foco passará a ser a "engenharia operacional de mídia" para monetização rápida, e não apenas geração determinística.

## 2. Ações Requeridas do Usuário (O que você precisa fazer)

Como você solicitou um passo a passo para leigos, aqui está exatamente o que você precisará fazer para que o sistema ganhe vida. Não faremos scraping ou automação de navegador (isso quebra). Usaremos as vias oficiais do YouTube (API).

### Etapa 2.1: Conseguir as Chaves do YouTube (Passo a Passo)

Siga isto com calma. O objetivo aqui é gerar um `Client ID` e um `Client Secret`.

1. **Acesse o Google Cloud Console:** Vá para [console.cloud.google.com](https://console.cloud.google.com/) e faça login com a conta Google dona do canal do YouTube.
2. **Crie um Projeto:** No canto superior esquerdo, ao lado do logo do Google Cloud, clique no nome do projeto atual (ou "Selecione um projeto"). Na janela que abrir, clique em **NOVO PROJETO** (New Project). Dê o nome de `CPWE-Channel-Manager` e clique em **CRIAR**.
3. **Ative a API do YouTube (Parte 1):** No menu lateral esquerdo, vá em **APIs e Serviços** > **Biblioteca**. Na barra de pesquisa, digite `YouTube Data API v3`. Clique nela e, em seguida, no botão azul **ATIVAR**.
4. **Ative a API do YouTube (Parte 2):** Volte para a Biblioteca, pesquise por `YouTube Analytics API`, clique nela e clique em **ATIVAR**.
5. **Configure a Tela de Consentimento (OAuth):** No menu lateral, vá em **APIs e Serviços** > **Tela de consentimento OAuth**. 
   - Selecione **Externo** (External) e clique em **CRIAR**.
   - **Nome do App:** Coloque `CPWE Engine`.
   - **E-mail de suporte do usuário:** Escolha seu email.
   - **Dados de contato do desenvolvedor:** Coloque seu email novamente.
   - Salve e continue em todas as outras telas até o fim sem mudar nada. (Você precisará adicionar seu email como "Test User" na tela de Usuários de Teste).
6. **Gere as Credenciais:** No menu lateral, vá em **APIs e Serviços** > **Credenciais**.
   - Clique em **+ CRIAR CREDENCIAIS** (Create Credentials) no topo da tela.
   - Escolha **ID do cliente OAuth** (OAuth client ID).
   - **Tipo de aplicativo:** Escolha **Aplicativo da Web** (Web application).
   - **Nome:** Pode deixar o padrão.
   - **URIs de redirecionamento autorizados:** Clique em *Adicionar URI* e cole exatamente isto: `http://localhost:3000/auth/youtube/callback` (Usaremos isso para você aprovar o acesso 1 vez pelo seu PC).
   - Clique em **CRIAR**.
7. **Pronto!** Vai aparecer uma janela com seu **Client ID** e **Client Secret**. Guarde esses dois códigos. Você os passará para mim depois, e eu os salvarei criptografados.

### Etapa 2.2: Definir o DNA do Canal

Copie as perguntas abaixo, cole no chat e responda para que eu possa codificar a *Channel Identity Layer (CIL)*.

**A. Estratégia do Canal**
- Nome do canal: 
- Objetivo financeiro: 
- Prazo para monetização: 
- Público-alvo (idade, perfil): 
- Nível técnico do público (básico, avançado?): 
- Idioma (ex: pt-BR): 
- Frequência (quantos vídeos por semana?): 
- Duração média dos vídeos: 
- Monetização principal atual: 
- Monetização futura desejada: 

**B. Brand Voice (Voz da Marca)**
- Tom de voz (ex: agressivo, premium, mentor, provocativo): 
- Ritmo/velocidade (lento e calmo, ou rápido e dinâmico?): 
- Coisas que a IA *nunca* deve dizer (palavras proibidas): 

**C. DNA Visual e Thumbnails**
- Cores principais da paleta: 
- Fontes preferidas (se souber): 
- Vai usar rosto humano na thumbnail? (Sim/Não): 
- Estilo da thumbnail (minimalista, muito texto, cores neon?): 

## 3. Plano Arquitetural de Implementação (Minha Parte)

Assim que você confirmar este plano e me der as respostas, começarei a codificar o seguinte, seguindo a ordem de prioridades do arquiteto:

### 3.1. Prioridade 1: Camada de Identidade (`src/channel/`)
- `ChannelProfile.ts`
- `BrandVoiceProfile.ts`
- `VisualIdentityProfile.ts`
- `PublishingProfile.ts`
- `MonetizationProfile.ts`

### 3.2. Prioridade 2: Integração YouTube (`src/integration/youtube/`)
- `YouTubeIntegrationService.ts` (Responsável pelo OAuth2, Upload de Vídeos, Set de Thumbnails e Query de Analytics).

### 3.3. Prioridade 3: Analytics Feedback Loop (`src/analytics/`)
- `YouTubeMetricsCollector.ts`
- `RetentionCurveAnalyzer.ts`
- `CTRAnalyzer.ts`
- `RPMTracker.ts`

### 3.4. Prioridade 4: Growth & Strategy Engines (`src/growth/`)
- `AdaptiveBenchmarkEngine.ts` (Recalibra hooks e pacing baseado no analytics real).
- `ThumbnailIntelligenceEngine.ts` (Garante que as thumbs não fiquem repetitivas visualmente).
- `PublishingStrategyEngine.ts` (Orquestra dias, horários e exploração de temas).
- `TopicSaturationEngine.ts` (Evita que o canal morra por saturação do mesmo tema).
- `RevenuePotentialScorer.ts` (Foca as decisões de conteúdo no que dá mais dinheiro/RPM, não só views).

## 4. Ordem de Execução

1. Você (Usuário) responde às perguntas do DNA (Etapa 2.2).
2. Eu implemento a **Camada de Identidade (CIL)** com as suas respostas fixadas.
3. Você me passa as chaves OAuth (Etapa 2.1).
4. Eu implemento o **YouTube Integration Service** e crio uma pequena rota local (`/auth/youtube/connect`) para você clicar, logar na sua conta Google e gerar os tokens de acesso.
5. Eu implemento o **Analytics Ingestion**.
6. Eu implemento as regras avançadas de **Growth (CGIS)**.
