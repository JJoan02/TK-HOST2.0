import { isOwner } from '../lib/permissions.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args }) => {
    if (!isOwner(m.sender)) throw 'Este comando solo puede ser usado por el owner.';

    let user = m.mentionedJid[0];
    if (!user) throw 'Debes mencionar al usuario para generar un código.';

    const codigo = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ahora = new Date();
    const expiraEn = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    data.codigos.push({
        codigo,
        usuario: user,
        creadoEn: ahora.toISOString(),
        expiraEn: expiraEn.toISOString(),
    });
    writeFileSync(codigosPath, JSON.stringify(data, null, 2));

    await conn.sendMessage(m.chat, { text: `Código generado para @${user.split('@')[0]}: *${codigo}*\nExpira: ${expiraEn.toLocaleDateString()}.` }, { mentions: [user] });
};

handler.help = ['generarcodigosb'];
handler.tags = ['jadibot'];
handler.command = /^generarcodigosb$/i;

export default handler;
