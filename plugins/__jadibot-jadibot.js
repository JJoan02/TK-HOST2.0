// plugins/__jadibot-jadibot.js
import Jadibot from "../lib/jadibot.js";
import { readFileSync } from 'fs';
import { join } from 'path';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn }) => {
    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    const codigo = data.codigos.find(c => c.usuario === m.sender && new Date(c.expiraEn) > new Date());

    if (codigo) {
        await Jadibot(m.sender, conn, m, true);
    } else {
        await conn.sendMessage(m.chat, { text: 'Para ser un bot, debes pagar $1 al owner +51 910 234 457 y solicitar un código válido.' });
    }
};

handler.help = ['jadibot'];
handler.tags = ['jadibot'];
handler.command = /^jadibot$/i;

export default handler;
