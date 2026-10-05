const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');

puppeteer.use(StealthPlugin());

// CONFIGURAÇÕES DO TELEGRAM
const TOKEN = '8660986937:AAGtYFWV2ZHipNHofzLUxAXTmXFi5tcraV8';
const CHAT_ID = '6984113905';

const bot = new TelegramBot(TOKEN, { polling: false });

async function iniciarBot() {
    console.log("Iniciando Santo Graal Invisível...");
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        // URL do Aviator (Lottu.bet / Aviator Studio)
        await page.goto('https://lottu.bet/aviator', { waitUntil: 'networkidle2', timeout: 60000 });
        console.log("Página carregada com sucesso.");

        // Loop de monitoramento de velas (candles)
        setInterval(async () => {
            try {
                // Captura o valor da última vela no histórico
                const ultimoMultiplicador = await page.evaluate(() => {
                    const velas = document.querySelectorAll('.multiplier-item'); // Seletor comum do Aviator
                    if (velas.length > 0) {
                        return velas[0].innerText;
                    }
                    return null;
                });

                if (ultimoMultiplicador) {
                    console.log(`Último resultado: ${ultimoMultiplicador}`);
                    
                    // Lógica de Sinal: Se a última vela for baixa (ex: < 1.5x), sinaliza entrada
                    const valor = parseFloat(ultimoMultiplicador.replace('x', ''));
                    
                    if (valor < 1.5) {
                        const mensagem = `🚀 **SINAL DE ENTRADA** 🚀\n\n` +
                                        `🎯 Alvo: 1.50x a 2.00x\n` +
                                        `⚠️ Confirmação: Vela baixa detectada (${ultimoMultiplicador})\n` +
                                        `🕒 Entrada: IMEDIATA`;
                        
                        await bot.sendMessage(CHAT_ID, mensagem, { parse_mode: 'Markdown' });
                        console.log("Sinal enviado ao Telegram!");
                    }
                }
            } catch (err) {
                console.error("Erro ao ler dados da página:", err.message);
            }
        }, 10000); // Verifica a cada 10 segundos

    } catch (error) {
        console.error("Erro crítico no navegador:", error);
        await browser.close();
    }
}

iniciarBot().catch(console.error);
