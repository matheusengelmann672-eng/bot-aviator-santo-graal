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
  res.end('Santo Graal v2 - Betuxo Mode Online!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Iniciando Captura Ultra Agressiva na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => request.continue());

    page.on('response', async response => {
      const url = response.url();
      // Filtro expandido para pegar qualquer fluxo de dados do jogo
      if (url.includes('api') || url.includes('game') || url.includes('ws') || url.includes('socket') || url.includes('betuxo')) {
        try {
          const text = await response.text();
          // Regex aprimorada para pegar números decimais comuns de multiplicadores
          const regex = /"multiplier":\s*(\d+\.\d{2})|(\d+\.\d{2})x/g; 
          let match;
          
          while ((match = regex.exec(text)) !== null) {
            const valor = match[1] || match[2];
            if (parseFloat(valor) > 1.0) {
              console.log(`🎯 ANTECIPAÇÃO CAPTURADA: ${valor}x`);
              bot.sendMessage(CHAT_ID, `🎯 RESULTADO DETECTADO NA BETUXO: ${valor}x\n🚀 ENTRADA CONFIRMADA!`);
            }
          }
        } catch (e) {}
      }
    });

    // Link da Betuxo que você passou
    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2' });
    bot.sendMessage(CHAT_ID, '🚀 Santo Graal Migrado para Betuxo! Monitorando API...');

  } catch (error) {
    console.error('Erro de conexão:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Sistema Betuxo Ativo. Aguardando interceptação de dados...');
});

iniciarSantoGraal();
