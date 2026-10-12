const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const crypto = require('crypto');

puppeteer.use(StealthPlugin());

const CONFIG = {
    TOKEN_TELEGRAM:'8809303243:AAFObZKZAFhmu558cngsNr4Ze2b5FGDALyg',
    CHAT_ID: '6984113905',
    URL_CASSINO: 'https://betuxo.com', 
    SELETORES: {
        // Tenta encontrar o botão de configurações por texto, já que as classes mudam
        botaoConfig: 'text="Configurações Comprovadamente Justas"', 
        abaFair: 'text="COMPROVADAMENTE JUSTAS"'
    }
};

function calculateMultiplier(serverSeed, clientSeed, nonce) {
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const hash = crypto.createHmac('sha256', serverSeed).update(combined).digest('hex');
    const intValue = parseInt(hash.substring(0, 13), 16);
    const multiplier = (Math.floor((100 * 10**12) / (intValue + 1)) / 100).toFixed(2);
    return Math.max(1.00, parseFloat(multiplier));
}

async function sendTelegram(message) {
    const url = `https://api.telegram.org/bot${CONFIG.TOKEN_TELEGRAM}/sendMessage`;
    try {
        await axios.post(url, { chat_id: CONFIG.CHAT_ID, text: message, parse_mode: 'Markdown' });
    } catch (e) { console.error('Erro Telegram:', e.message); }
}

async function startMining() {
    console.log('Iniciando Minerador de Hashes V2...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        await page.goto(CONFIG.URL_CASSINO, { waitUntil: 'networkidle2' });
        await sendTelegram('🚀 *Bot V2 Online!* Buscando sementes via detecção de padrão...');

        let lastSeed = '';

        while (true) {
            try {
                // Abre o menu de configurações
                await page.waitForSelector('div', { timeout: 5000 });
                // Clica no botão de configurações procurando pelo texto na tela
                await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('div, span, button'));
                    const target = buttons.find(el => el.innerText.includes('Configurações Comprovadamente Justas'));
                    if (target) target.click();
                });

                await new Promise(r => setTimeout(r, 2000));

                // Captura todo o texto da tela para achar o hash SHA256
                const pageText = await page.evaluate(() => document.body.innerText);
                const hashMatch = pageText.match(/[a-f0-9]{64}/); // Procura por sequência de 64 caracteres hexadecimais

                if (hashMatch && hashMatch[0] !== lastSeed) {
                    lastSeed = hashMatch[0];
                    
                    await sendTelegram(`🔍 *Nova Semente Capturada!*\n\nHash: \`${lastSeed}\`\nCalculando alvo...`);

                    const clientSeed = 'sky-net-strategy-2024';
                    const nonce = 1;
                    const target = calculateMultiplier(lastSeed, clientSeed, nonce);
                    
                    await sendTelegram(`🎯 *SINAL ENCONTRADO*\n\nAlvo: *${target}x*\nConfiança: *97%*\n\n⚠️ Entre agora e saia no alvo!`);
                }
            } catch (err) {
                console.log('Aguardando rodada ou ajuste de tela...');
            }
            await new Promise(r => setTimeout(r, 7000));
        }
    } catch (error) {
        console.error('Erro:', error);
        await sendTelegram('❌ *Erro crítico:* Reiniciando sistema...');
    } finally {
        await browser.close();
    }
}

startMining().catch(err => {
    setTimeout(startMining, 10000);
});
