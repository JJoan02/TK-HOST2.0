// plugins/__canjearcodigosb.js
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Jadibot from '../lib/jadibot.js';
import qrcode from 'qrcode';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args }) => {
    const codigoIngresado = args[0];
    if (!codigoIngresado || !/^(\d{4}-\d{4})$/.test(codigoIngresado)) throw 'Debes ingresar un código válido en formato xxxx-xxxx.';

    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    const codigo = data.codigos.find(c => c.codigo === codigoIngresado);

    if (!codigo) throw 'Código inválido.';
    if (codigo.usuario !== m.sender) throw 'Este código no está registrado para tu número.';
    if (new Date() > new Date(codigo.expiraEn)) throw 'Este código ha expirado.';

    try {
        await Jadibot(m.sender, conn, m, true);
        await conn.sendMessage(m.chat, { text: 'Sub-Bot vinculado exitosamente.' }, { quoted: m });
    } catch (e) {
        if (e.message.includes('pairing code')) {
            // Generar código de vinculación
            const pairingCode = await generatePairingCode();
            await conn.sendMessage(m.chat, { text: `Tu código de vinculación es: *${pairingCode}*\nIngresa este código en tu WhatsApp para completar la vinculación.` }, { quoted: m });
        } else {
            throw `Error al vincular el bot: ${e.message}`;
        }
    }
};

async function generatePairingCode() {
    // Generar código de 8 dígitos
    const code = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    return code;
}

handler.help = ['canjearcodigosb <codigo>'];
handler.tags = ['jadibot'];
handler.command = /^canjearcodigosb$/i;

export default handler;


handler.help = ['canjearcodigosb'];
handler.tags = ['jadibot'];
handler.command = /^canjearcodigosb$/i;

export default handler;
