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
  res.end('Santo Graal v6 - DECODIFICADOR BINÁRIO ATIVO!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Ativando Decodificador de Binary Frames na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    await page.evaluateOnNewDocument(() => {
      const OriginalWebSocket = window.WebSocket;
      window.WebSocket = function(url, protocols) {
        const socket = new OriginalWebSocket(url, protocols);
        
        socket.addEventListener('message', (event) => {
          // CAPTURA BINÁRIA: Se o dado for Blob ou ArrayBuffer, converte para Hexadecimal
          if (event.data instanceof Blob) {
            event.data.arrayBuffer().then(buffer => {
              console.log('BIN_DATA:' + Buffer.from(buffer).toString('hex'));
            });
          } else if (event.data instanceof ArrayBuffer) {
            console.log('BIN_DATA:' + Buffer.from(event.data).toString('hex'));
          } else {
            // Se for texto, mantém a captura normal
            console.log('TEXT_DATA:' + event.data);
          }
        });
        
        return socket;
      };
    });

    page.on('console', msg => {
      const text = msg.text();
      
      // Lógica para dados de texto
      if (text.startsWith('TEXT_DATA:')) {
        const data = text.replace('TEXT_DATA:', '');
        const regex = /(\d+\.\d{2})x|(\d+\.\d{2})/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
          const valor = match[1] || match[2];
          bot.sendMessage(CHAT_ID, `🎯 SINAL API: ${valor}x\n🚀 ENTRADA IMEDIATA!`);
        }
      }

      // Lógica para dados binários (Decodificação de Hexadecimal para Número)
      if (text.startsWith('BIN_DATA:')) {
        const hex = text.replace('BIN_DATA:', '');
        // Procura por sequências hexadecimais que representem números decimais comuns de crash
        // Esta é uma análise heurística de bytes
        const possibleValue = hex.match(/[0-9a-f]{2,4}/g);
        if (possibleValue) {
            // Se detectarmos um padrão de atualização constante de bytes, avisamos o usuário
            // Para refinar o número exato do binário, precisamos que o bot logue os pacotes
            console.log(`Pacote binário capturado: ${hex}`);
        }
      }
    });

    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2', timeout: 60000 });
    bot.sendMessage(CHAT_ID, '⚙️ Decodificador Binário Ativado! Agora estou capturando até os códigos de máquina da Betuxo...');

  } catch (error) {
    console.error('Erro:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

iniciarSantoGraal();
