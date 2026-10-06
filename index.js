const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

puppeteer.use(StealthPlugin());

// CONFIGURAÇÕES DO TELEGRAM
const TOKEN = '8660986937:AAGtYFWV2ZHipNHofzLUxAXTmXFi5tcraV8';
const CHAT_ID = '6984113905';

const bot = new TelegramBot(TOKEN, { polling: true });

// SIMULADOR DE SITE PARA O RENDER NÃO DERRUBAR
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Santo Graal Online e Ativo!');
}).listen(port, () => {
  console.log(`Porta ${port} aberta. Render não vai derrubar o bot.`);
});

async function iniciarSantoGraal() {
  console.log('Iniciando Santo Graal Invisível...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ]
  });

  try {
    const page = await browser.newPage();
    
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      request.continue();
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('aviator') || url.includes('game') || url.includes('ws')) {
        try {
          const text = await response.text();
          const match = text.match(/"multiplier":\s*(\d+\.\d+)/) || text.match(/"result":\s*(\d+\.\d+)/);
          
          if (match && match[1]) {
            const valor = match[1];
            console.log(`🎯 SINAL DETECTADO: ${valor}x`);
            bot.sendMessage(CHAT_ID, `🎯 RESULTADO DETECTADO: ${valor}x\n🚀 Entre agora!`);
          }
        } catch (e) {
          // Silenciar erros de parsing
        }
      }
    });

    // CORREÇÃO AQUI: Fechamento correto das aspas em 'networkidle2'
    await page.goto('https://lottu.bet/aviator', { waitUntil: 'networkidle2' });
    
    console.log('Conectado ao Aviator com sucesso!');
    bot.sendMessage(CHAT_ID, '🚀 Santo Graal Online e Estável!\nO sistema agora está blindado contra quedas do Render. Aguarde os sinais.');

  } catch (error) {
    console.error('Erro ao conectar:', error);
    bot.sendMessage(CHAT_ID, '⚠️ Erro de conexão. Reiniciando em 30 segundos...');
    setTimeout(iniciarSantoGraal, 30000);
  }
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Sistema Ativo. O Santo Graal está capturando os dados do servidor em tempo real. Aguarde os sinais.');
});

iniciarSantoGraal();
