import { readFileSync } from 'fs';
import { join } from 'path';
import Jadibot from '../lib/jadibot.js';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn }) => {
    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    const codigo = data.codigos.find(c => c.usuario === m.sender && new Date(c.expiraEn) > new Date());

    if (codigo) {
        await Jadibot(m.sender, conn, m, true);
    } else {
        await conn.sendMessage(m.chat, { text: 'Para ser bot, paga $1 al owner +51 910 234 457 y solicita un código válido.' });
    }
};

handler.help = ['serbot'];
handler.tags = ['jadibot'];
handler.command = /^serbot$/i;

export default handler;
