const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');

puppeteer.use(StealthPlugin());

// CONFIGURAÇÕES DO SEU BOT
const token = '8660986937:AAGtYFWV2ZHipNHofzLUxAXTmXFi5tcraV8';
const chatId = '6984113905';
const bot = new TelegramBot(token, { polling: true });

async function iniciarSantoGraal() {
    console.log("Iniciando Santo Graal Invisível...");
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Captura de tráfego WebSocket para interceptar o multiplicador
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        await page.goto('https://lottu.bet/aviator', { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log("Conectado ao Aviator com sucesso!");
        bot.sendMessage(chatId, "🚀 Santo Graal Online! Monitorando os multiplicadores agora...");

        // Lógica de interceptação de pacotes
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('game-result') || url.includes('socket')) {
                try {
                    const data = await response.text();
                    if (data.includes('multiplier')) {
                        // Aqui ele extrai o valor do multiplicador do servidor
                        const match = data.match(/"multiplier":\s*([\d.]+)/);
                        if (match) {
                            const valor = match[1];
                            bot.sendMessage(chatId, `🎯 RESULTADO DETECTADO: ${valor}x`);
                        }
                    }
                } catch (e) {}
            }
        });

    } catch (error) {
        console.error("Erro crítico:", error);
        bot.sendMessage(chatId, "❌ Erro ao iniciar o sistema. Reiniciando...");
        setTimeout(iniciarSantoGraal, 10000);
    }
}

// Comando de teste para o usuário
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Sistema Ativo. O Santo Graal está capturando os dadosdo servidor em tempo real. Aguarde os sinais.");
});

iniciarSantoGraal();
