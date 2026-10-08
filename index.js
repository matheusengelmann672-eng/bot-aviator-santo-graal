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
  res.end('Santo Graal v7 - CAPTURA GLOBAL DE REDE!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Iniciando Captura Global de Rede na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    // Ativa a interceptação de rede do Puppeteer
    await page.setRequestInterception(true);

    page.on('request', request => {
      request.continue();
    });

    // Captura a resposta de cada requisição de rede
    page.on('response', async response => {
      const url = response.url();
      
      // Filtramos apenas requisições que pareçam vir de APIs de jogos ou dados
      if (url.includes('api') || url.includes('game') || url.includes('socket') || url.includes('event')) {
        try {
          const text = await response.text();
          console.log('NET_DATA:' + text);
          
          // Procura por multiplicadores (ex: 1.50, 2.10)
          const regex = /(\d+\.\d{2})x|(\d+\.\d{2})/g;
          let match;
          while ((match = regex.exec(text)) !== null) {
            const valor = match[1] || match[2];
            bot.sendMessage(CHAT_ID, `🎯 SINAL CAPTURADO: ${valor}x\n🚀 ENTRADA IMEDIATA!`);
          }
        } catch (e) {
          // Ignora erros de respostas vazias ou binárias não legíveis
        }
      }
    });

    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2', timeout: 60000 });
    bot.sendMessage(CHAT_ID, '🌐 Captura Global de Rede Ativada! Agora estou monitorando TODO o tráfego da Betuxo...');

  } catch (error) {
    console.error('Erro:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

iniciarSantoGraal();
