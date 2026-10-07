const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

puppeteer.use(StealthPlugin());

const TOKEN = '8977556344:AAFQCUaPqnEqfCzqBT3j5SKkZWq-6FH_krA'; 
const CHAT_ID = '6984113905';
const bot = new TelegramBot(TOKEN, { polling: true });

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Santo Graal v4 - Interceptação de Túnel WS!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Ativando Escuta de Túnel WebSocket na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    // SEGREDO TÉCNICO: Injetando interceptor de WebSocket diretamente no navegador
    await page.evaluateOnNewDocument(() => {
      const OriginalWebSocket = window.WebSocket;
      window.WebSocket = function(url, protocols) {
        const socket = new OriginalWebSocket(url, protocols);
        
        socket.addEventListener('message', (event) => {
          // Envia a mensagem do WebSocket para o console do Puppeteer
          console.log('WS_DATA:' + event.data);
        });
        
        return socket;
      };
    });

    // Escuta o console do navegador para pegar os dados do WebSocket
    page.on('console', msg => {
      const text = msg.text();
      if (text.startsWith('WS_DATA:')) {
        const data = text.replace('WS_DATA:', '');
        const regex = /(\d+\.\d{2})x|(\d+\.\d{2})/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
          const valor = match[1] || match[2];
          const num = parseFloat(valor);
          if (num > 1.10 && num < 1000) {
            bot.sendMessage(CHAT_ID, `🚨 ANTECIPAÇÃO VIA TUNEL: ${valor}x\n🚀 ENTRADA IMEDIATA!`);
          }
        }
      }
    });

    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2', timeout: 60000 });
    bot.sendMessage(CHAT_ID, '🛡️ Escuta de Túnel Ativa! Agora estou ouvindo a conversa interna da Betuxo...');

  } catch (error) {
    console.error('Erro crítico:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

iniciarSantoGraal();
