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
  res.end('Santo Graal v12 - SEQUESTRO DE WEBSOCKET ATIVO!');
}).listen(port);

async function iniciarSantoGraal() {
  console.log('Iniciando Sequestro de WebSocket na Betuxo...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    // INJEÇÃO DE GRAMPO NO WEBSOCKET
    await page.evaluateOnNewDocument(() => {
      const OriginalWebSocket = window.WebSocket;
      window.WebSocket = function(url, protocols) {
        const socket = new OriginalWebSocket(url, protocols);
        
        // Intercepta mensagens recebidas do servidor
        socket.addEventListener('message', (event) => {
          let data = event.data;
          
          // Se o dado for binário (Blob ou ArrayBuffer), converte para texto
          if (data instanceof Blob) {
            data.text().then(text => window.postMessage({ type: 'WS_DATA', content: text }, '*'));
          } else if (data instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(data);
            window.postMessage({ type: 'WS_DATA', content: text }, '*');
          } else {
            window.postMessage({ type: 'WS_DATA', content: data }, '*');
          }
        });
        
        return socket;
      };
      // Mantém as propriedades do WebSocket original
      window.WebSocket.prototype = OriginalWebSocket.prototype;
    });

    // Escuta as mensagens que o grampo enviou do navegador para o Puppeteer
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    
    // Captura os dados via postMessage
    const session = await page.target().createCDPSession();
    await session.send('Runtime.enable');
    session.on('Runtime.consoleAPICalled', (params) => {
      const args = params.args;
      if (args && args[0] && args[0].value) {
        const text = args[0].value;
        const regex = /(\d+\.\d{2})/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          bot.sendMessage(CHAT_ID, `🚀 SINAL DETECTADO VIA WEBSOCKET: ${match[1]}x`);
        }
      }
    });

    // Força a captura de logs do navegador
    await page.evaluate(() => {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'WS_DATA') {
          console.log('DATA_CAPTURE: ' + event.data.content);
        }
      });
    });

    await page.goto('https://go.betuxo.bet/c/7qe', { waitUntil: 'networkidle2', timeout: 60000 });
    bot.sendMessage(CHAT_ID, '⚡ Sequestro de WebSocket Ativado! Agora estou grampeando a conexão binária da Betuxo...');

  } catch (error) {
    console.error('Erro:', error);
    setTimeout(iniciarSantoGraal, 30000);
  }
}

iniciarSantoGraal();
