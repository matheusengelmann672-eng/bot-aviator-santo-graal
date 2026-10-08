const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

puppeteer.use(StealthPlugin());

const TOKEN = '8692586847:AAHmcjVYaKQYb-0xqzyIx6PJ4bUWhxLCLGg'; 
const CHAT_ID = '6984113905';
const bot = new TelegramBot(TOKEN, { polling: true });

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Santo Graal v11 - ASPIRADOR DE DADOS ATIVO!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Iniciando Aspirador de Dados na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    await page.evaluateOnNewDocument(() => {
      // Sequestro total do JSON.parse para ver TUDO que chega
      const originalParse = JSON.parse;
      JSON.parse = function(text) {
        const data = originalParse(text);
        console.log('DEBUG_API_RAW: ' + text); // Manda o texto bruto para o log
        return data;
      };

      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        const clone = response.clone();
        clone.text().then(text => {
          console.log('DEBUG_FETCH_RAW: ' + text);
        });
        return response;
      };
    });

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('DEBUG_')) {
        // Se encontrar qualquer padrão de número decimal (X.XX), manda pro Telegram naora, o Telegram para a gente analisar.
        const regex = /(\d+\.\d{2})/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const valor = match[1];
          bot.sendMessage(CHAT_ID, `🔍 DADO BRUTO DETECTADO: ${valor}x\nAnalisando padrão...`);
        }
      }
    });

    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2', timeout: 60000 });
    bot.sendMessage(CHAT_ID, '📡 Aspirador de Dados Ativo! Agora estou capturando TUDO o que a API envia para analisar o padrão...');

  } catch (error) {
    console.error('Erro:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

iniciarSantoGraal();
