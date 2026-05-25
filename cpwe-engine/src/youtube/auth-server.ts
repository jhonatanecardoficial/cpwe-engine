import * as http from 'http';
import * as url from 'url';
import { YouTubeIntegrationService } from './YouTubeIntegrationService';

const ytService = new YouTubeIntegrationService();

const server = http.createServer(async (req, res) => {
  const reqUrl = url.parse(req.url || '', true);

  // 1. Inicia o fluxo OAuth
  if (reqUrl.pathname === '/' || reqUrl.pathname === '/auth/youtube/connect') {
    const authUrl = ytService.getAuthUrl();
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }

  // 2. Recebe o callback do Google
  if (reqUrl.pathname === '/auth/youtube/callback') {
    const code = reqUrl.query.code as string;
    
    if (code) {
      try {
        const tokens = await ytService.getTokensFromCode(code);
        console.log('\n\n✅ SUCESSO! AUTENTICAÇÃO CONCLUÍDA!\n');
        console.log('====================================');
        console.log('SEUS TOKENS SÃO:');
        console.log(JSON.stringify(tokens, null, 2));
        console.log('====================================');
        console.log('\n⚠️ GUARDE ESTE CONTEÚDO! Ele será usado para o bot acessar o canal sem precisar logar de novo.');
        console.log('Você já pode parar este servidor no terminal (Ctrl+C).');
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #4CAF50;">Autenticação Concluída com Sucesso!</h1>
            <p>O CPWE agora tem permissão para gerenciar o canal Riqueza Invisível.</p>
            <p><strong>Volte para o terminal do seu VSCode</strong>. Você verá os seus tokens (access_token e refresh_token) impressos lá.</p>
            <p>Você pode fechar esta aba.</p>
          </div>
        `);
      } catch (error) {
        console.error('Erro ao pegar tokens:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erro ao processar tokens. Olhe o terminal.');
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Nenhum código OAuth recebido na URL.');
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found. Acesse http://localhost:3000/auth/youtube/connect');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Servidor de Autenticação do YouTube Iniciado!`);
  console.log(`======================================================`);
  console.log(`1. Clique (ou copie e cole) no link abaixo no seu navegador:`);
  console.log(`   http://localhost:${PORT}/auth/youtube/connect`);
  console.log(`2. Faça o login com a conta Google do canal.`);
  console.log(`3. Autorize as permissões.\n`);
});
