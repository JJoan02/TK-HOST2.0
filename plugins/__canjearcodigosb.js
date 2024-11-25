import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Jadibot from '../lib/jadibot.js';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args }) => {
    const codigoIngresado = args[0];
    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    const codigo = data.codigos.find(c => c.codigo === codigoIngresado);

    if (!codigo) throw 'Código inválido.';
    if (codigo.usuario !== m.sender) throw 'Código no registrado para este número.';
    if (new Date() > new Date(codigo.expiraEn)) throw 'Código expirado.';

    await Jadibot(m.sender, conn, m, true);
    await conn.sendMessage(m.chat, { text: 'Sub-Bot vinculado exitosamente.' });
};

handler.help = ['canjearcodigosb'];
handler.tags = ['jadibot'];
handler.command = /^canjearcodigosb$/i;

export default handler;
