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
  res.end('Santo Graal v10 - BOT NOVO E BLINDADO!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Iniciando Sequestro de Processamento de API na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    await page.evaluateOnNewDocument(() => {
      const originalParse = JSON.parse;
      JSON.parse = function(text) {
        const data = originalParse(text);
        if (typeof data === 'string' && data.match(/\d+\.\d{2}/)) {
          console.log('API_JSON_DATA:' + data);
        } else if (typeof data === 'object') {
          const searchValues = (obj) => {
            for (let key in obj) {
              if (typeof obj[key] === 'number' && obj[key] > 1 && obj[key] < 1000) {
                console.log('API_JSON_VAL:' + obj[key]);
              } else if (typeof obj[key] === 'object') {
                searchValues(obj[key]);
              }
            }
          };
          searchValues(data);
        }
        return data;
      };

      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
          console.log('API_XHR_DATA:' + this.responseText);
        });
        return originalOpen.apply(this, arguments);
      };

      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        const clone = response.clone();
        clone.text().then(text => {
          console.log('API_FETCH_DATA:' + text);
        });
        return response;
      };
    });

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('API_')) {
        const regex = /(\d+\.\d{2})/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const valor = match[1];
          bot.sendMessage(CHAT_ID, `🎯 SINAL API (SEQUESTRO): ${valor}x\n🚀 ENTRADA IMEDIATA!`);
        }
      }
    });

    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2', timeout: 60000 });
    bot.sendMessage(CHAT_ID, '⚡ Bot Novo Ativo! Sequestro de API em operação na Betuxo...');

  } catch (error) {
    console.error('Erro:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

iniciarSantoGraal();
