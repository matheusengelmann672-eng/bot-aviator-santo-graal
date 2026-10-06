const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

puppeteer.use(StealthPlugin());

const TOKEN = '8660986937:AAGtYFWV2ZHipNHofzLUxAXTmXFi5tcraV8';
const CHAT_ID = '6984113905';

const bot = new TelegramBot(TOKEN, { polling: true });

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Santo Graal Online!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Iniciando Captura Agressiva...');
  
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
      // Filtro expandido para pegar qualquer resposta de dados do jogo
      if (url.includes('api') || url.includes('game') || url.includes('ws') || url.includes('socket')) {
        try {
          const text = await response.text();
          
          // Regex Agressiva: Procura por qualquer número decimal seguido de 'x' ou dentro de JSON
          // Captura padrões como 1.50, 2.00, 10.45
          const regex = /(\d+\.\d{2})/g; 
          const matches = text.match(regex);
          
          if (matches) {
            // Pegamos o último número decimal encontrado no pacote, que geralmente é o resultado
            const valor = matches[matches.length - 1];
            if (parseFloat(valor) > 1.0) {
              console.log(`🎯 SINAL CAPTURADO: ${valor}x`);
              bot.sendMessage(CHAT_ID, `🎯 RESULTADO DETECTADO: ${valor}x\n🚀 ENTRADA CONFIRMADA!`);
            }
          }
        } catch (e) {}
      }
    });

    await page.goto('https://lottu.bet/aviator', { waitUntil: 'networkidle2' });
    bot.sendMessage(CHAT_ID, '🚀 Santo Graal Atualizado! Modo Captura Agressiva Ativado. Aguarde os sinais.');

  } catch (error) {
    console.error('Erro:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Sistema Ativo e Monitorando tráfego bruto do servidor.');
});

iniciarSantoGraal();
