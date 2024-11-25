// plugins/__jadibot-jadibot.js
import { readFileSync } from 'fs';
import { join } from 'path';
import Jadibot from '../lib/jadibot.js';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn }) => {
    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    const codigo = data.codigos.find(c => c.usuario === m.sender && new Date(c.expiraEn) > new Date());

    if (codigo) {
        try {
            await Jadibot(m.sender, conn, m, true);
        } catch (e) {
            if (e.message.includes('pairing code')) {
                // Generar cÃ³digo de vinculaciÃ³n
                const pairingCode = await generatePairingCode();
                await conn.sendMessage(m.chat, { text: `Tu cÃ³digo de vinculaciÃ³n es: *${pairingCode}*\nIngresa este cÃ³digo en tu WhatsApp para completar la vinculaciÃ³n.` }, { quoted: m });
            } else {
                throw `Error al vincular el bot: ${e.message}`;
            }
        }
    } else {
        await conn.sendMessage(m.chat, { text: 'Para ser un bot, debes pagar $1 al owner +51 910 234 457 y solicitar un cÃ³digo vÃ¡lido.' });
    }
};

async function generatePairingCode() {
    // Generar cÃ³digo de 8 dÃ­gitos
    const code = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    return code;
}

handler.help = ['jadibot'];
handler.tags = ['jadibot'];
handler.command = /^jadibot$/i;

export default handler;


// Manage QR and code linking based on user input
const { handleLinking } = require('../lib/subbot');

module.exports = async (conn, m) => {
    const command = m.text.toLowerCase();
    if (command === '.vincularqr' || command === '.vincularcode') {
        await handleLinking(conn, m.chat, command);
    }
};
