// plugins/__serbot.js
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Jadibot from '../lib/jadibot.js';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args }) => {
    let codigoVinculacion = args[0];
    if (!codigoVinculacion) throw 'Debes ingresar el código de vinculación.';

    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    let vinculo = data.vinculaciones.find(v => v.codigoVinculacion === codigoVinculacion && v.usuario === m.sender);

    if (!vinculo) throw 'Código de vinculación inválido o no está asociado a tu número.';
    if (new Date() > new Date(vinculo.expiraEn)) throw 'El código de vinculación ha expirado.';

    // Proceder a iniciar el sub-bot
    try {
        await Jadibot(m.sender, conn, m, true); // true para indicar que use pairing code
        m.reply('¡Has sido vinculado exitosamente como sub-bot!');
    } catch (e) {
        throw `Error al vincular el bot: ${e.message}`;
    }

    // Eliminar el código de vinculación después de usarlo
    data.vinculaciones = data.vinculaciones.filter(v => v.codigoVinculacion !== codigoVinculacion);
    writeFileSync(codigosPath, JSON.stringify(data, null, 2));
};

// plugins/__serbot.js
// ... (mismo código anterior)

let handler = async (m, { conn, args }) => {
    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    let sessionPath = join(authFolder, m.sender.split('@')[0]);

    if (existsSync(sessionPath)) {
        // Si ya existe la sesión, reconectar
        try {
            await Jadibot(m.sender, conn, m);
            m.reply('¡Te has reconectado exitosamente como sub-bot!');
        } catch (e) {
            throw `Error al reconectar el bot: ${e.message}`;
        }
    } else {
        // Si no existe sesión, solicitar código de vinculación
        m.reply('No tienes una sesión activa. Por favor, canjea un código primero usando `.canjearcodigosb`.');
    }
};

handler.command = /^serbot$/i;
export default handler;
