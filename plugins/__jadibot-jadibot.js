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
                // Generar código de vinculación
                const pairingCode = await generatePairingCode();
                await conn.sendMessage(m.chat, { text: `Tu código de vinculación es: *${pairingCode}*\nIngresa este código en tu WhatsApp para completar la vinculación.` }, { quoted: m });
            } else {
                throw `Error al vincular el bot: ${e.message}`;
            }
        }
    } else {
        await conn.sendMessage(m.chat, { text: 'Para ser un bot, debes pagar $1 al owner +51 910 234 457 y solicitar un código válido.' });
    }
};

async function generatePairingCode() {
    // Generar código de 8 dígitos
    const code = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    return code;
}

handler.help = ['jadibot'];
handler.tags = ['jadibot'];
handler.command = /^jadibot$/i;

export default handler;

