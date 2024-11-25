// plugins/__listcodigos.js
import { isOwner } from '../lib/permissions.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn }) => {
    if (!isOwner(m.sender)) throw 'Este comando solo puede ser usado por el owner.';

    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    if (data.codigos.length === 0) return m.reply('No hay códigos generados.');

    let texto = '*Códigos Activos:*\n\n';
    data.codigos.forEach((c, i) => {
        texto += `${i + 1}. Código: *${c.codigo}*\n   Usuario: @${c.usuario.split('@')[0]}\n   Expira: ${new Date(c.expiraEn).toLocaleDateString()}\n\n`;
    });

    await conn.sendMessage(m.chat, { text: texto.trim(), mentions: data.codigos.map(c => c.usuario) });
};

handler.help = ['listcodigos'];
handler.tags = ['jadibot'];
handler.command = /^listcodigos$/i;

export default handler;
