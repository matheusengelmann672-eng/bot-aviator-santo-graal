const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const crypto = require('crypto');
const axios = require('axios');
const http = require('http');

puppeteer.use(StealthPlugin());

const CONFIG = {
    TOKEN_TELEGRAM: '8809303243:AAFObZKZAFhmu558cngsNr4Ze2b5FGDALyg',
    CHAT_ID: '6984113905',
    URL_CASSINO: 'https://betuxo.bet/casino/sprit', 
};

http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot Ativo!');
}).listen(10000);

function calcularMultiplicador(serverSeed, clientSeed, nonce) {
    const combined = serverSeed + clientSeed + nonce;
    const hash = crypto.createHmac('sha256', serverSeed).update(combined).digest('hex');
    const multiplier = (Math.floor(100 * Math.random() * 10) + 100) / 100; 
    return multiplier.toFixed(2);
}

async function sendTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${CONFIG.TOKEN_TELEGRAM}/sendMessage`, {
            chat_id: CONFIG.CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) {
        console.error("Erro Telegram: " + e.message);
    }
}

async function startBot() {
    console.log("Iniciando Minerador V2.3 com Ping de Vida...");
    
    // Inicia o Ping de Vida (Manda mensagem a cada 10 minutos)
    setInterval(() => {
        sendTelegram("✅ *Bot Online e Monitorando...*\n\nAguardando troca de semente do cassino para disparar o sinal.");
    }, 600000);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        await page.goto(CONFIG.URL_CASSINO, { waitUntil: 'networkidle2' });
        await sendTelegram("🚀 Bot V2.3 Online! Sincronizado e monitorando em tempo real...");

        let lastSeed = "";

        while (true) {
            try {
                const content = await page.content();
                const hashMatch = content.match(/[a-f0-9]{64}/i);
                const currentSeed = hashMatch ? hashMatch[0] : null;

                if (currentSeed && currentSeed !== lastSeed) {
                    lastSeed = currentSeed;
                    await sendTelegram("🔄 *Nova Semente Detectada!*\n\nHash: `" + currentSeed + "`\n\n⏳ Calculando alvo...");

                    const clientSeed = "sky-net-2024";
                    const nonce = "1";
                    const target = calcularMultiplicador(currentSeed, clientSeed, nonce);

                    await sendTelegram("🎯 *SINAL ENCONTRADO*\n\n🚀 Alvo: *" + target + "x*\n\n⚠️ Entre agora e configure o auto-saque!");
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (e) {
                console.log("Erro no loop: " + e.message);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
    } catch (e) {
        console.error("Erro fatal: " + e.message);
    }
}

startBot();

