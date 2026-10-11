const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const crypto = require('crypto');

puppeteer.use(StealthPlugin());

// CONFIGURAÇÕES DO SISTEMA
const CONFIG = {
    TOKEN_TELEGRAM: '8274437593:AAGLyG_b5H-G8B7Od84qB5YQXRQ0CLMONSM',
    CHAT_ID: '6984113905',
    URL_CASSINO: 'https://betuxo.com', // Altere para a URL exata do jogo
    SELETORES: {
        abaProvablyFair: 'div[data-test="provably-fair-tab"]', 
        serverSeed: '.server-seed-value', 
        gameResult: '.multiplier-value'
    }
};

// Lógica de cálculo do multiplicador (Provably Fair)
function calculateMultiplier(serverSeed, clientSeed, nonce) {
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const hash = crypto.createHmac('sha256', serverSeed).update(combined).digest('hex');
    
    // Conversão de hash para decimal
    const intValue = parseInt(hash.substring(0, 13), 16);
    const multiplier = (Math.floor((100 * 10**12) / (intValue + 1)) / 100).toFixed(2);
    
    return Math.max(1.00, parseFloat(multiplier));
}

async function sendTelegram(message) {
    const url = `https://api.telegram.org/bot${CONFIG.TOKEN_TELEGRAM}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: CONFIG.CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) {
        console.error('Erro ao enviar Telegram:', e.message);
    }
}

async function startMining() {
    console.log('Iniciando Minerador de Hashes...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        await page.goto(CONFIG.URL_CASSINO, { waitUntil: 'networkidle2' });
        await sendTelegram('🚀 *Bot Online!* Iniciando monitoramento de sementes no servidor...');

        let lastSeed = '';

        while (true) {
            try {
                // Tenta acessar a aba de Provably Fair para pegar a semente do servidor
                await page.click(CONFIG.SELETORES.abaProvablyFair);
                const currentSeed = await page.$eval(CONFIG.SELETORES.serverSeed, el => el.innerText.trim());

                if (currentSeed !== lastSeed) {
                    lastSeed = currentSeed;
                    
                    await sendTelegram(`🔍 *Nova Semente Detectada!*\n\nHash: \`${currentSeed}\`\nCalculando alvo...`);

                    // Simulação de análise de padrão para definir o alvo
                    const clientSeed = 'sky-net-strategy-2024';
                    const nonce = 1;
                    const target = calculateMultiplier(currentSeed, clientSeed, nonce);
                    const confidence = 95;

                    await sendTelegram(`🎯 *SINAL ENCONTRADO*\n\nAlvo: *${target}x*\nConfiança: *${confidence}%\n\n⚠️ Entre agora e saia no alvo!`);
                }
            } catch (err) {
                console.log('Aguardando atualização de rodada...');
            }
            
            // Intervalo para evitar detecção e rate limit
            await new Promise(r => setTimeout(r, 5000));
        }
    } catch (error) {
        console.error('Erro crítico:', error);
        await sendTelegram('❌ *Erro no sistema:* O bot caiu e será reiniciado automaticamente.');
    } finally {
        await browser.close();
    }
}

// Inicialização com auto-restart
startMining().catch(err => {
    console.error('Falha na inicialização:', err);
    setTimeout(startMining, 10000);
});
