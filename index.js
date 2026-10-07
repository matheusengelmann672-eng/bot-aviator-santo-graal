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
  res.end('Santo Graal v3 - Modo Captura Total!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Iniciando Captura Total na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => request.continue());

    page.on('response', async response => {
      try {
        const url = response.url();
        const text = await response.text();
        
        // REGEX ULTRA-ABRANGENTE: Procura por qualquer número com 2 casas decimais 
        // que esteja entre aspas ou seguido de 'x', ignorando nomes de arquivos.
        const regex = /"(\d+\.\d{2})"(?=.*)|(\d+\.\d{2})x/g; 
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          const valor = match[1] || match[2];
          const num = parseFloat(valor);
          
          // Filtro para evitar números inúteis (pega só acima de 1.10)
          if (num > 1.10 && num < 1000) {
            console.log(`🎯 CAPTURA BRUTA: ${valor}x`);
            bot.sendMessage(CHAT_ID, `🎯 SINAL DETECTADO: ${valor}x\n🚀 POSSÍVEL ANTECIPAÇÃO!`);
          }
        }
      } catch (e) {}
    });

    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2', timeout: 60000 });
    bot.sendMessage(CHAT_ID, '🚀 Modo Captura Total Ativado! Vasculhando toda a rede da Betuxo...');

  } catch (error) {
    console.error('Erro:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

iniciarSantoGraal();
