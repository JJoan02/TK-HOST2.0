// plugins/__serbot.js

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Jadibot } from '../lib/jadibot.js';
import { authFolder } from '../lib/jadibots.js';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args }) => {
    let codigoVinculacion = args[0];

    if (codigoVinculacion) {
        // El usuario ingresa un código de vinculación
        let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
        let vinculo = data.vinculaciones.find(v => v.codigoVinculacion === codigoVinculacion && v.usuario === m.sender);

        if (!vinculo) throw 'Código de vinculación inválido o no está asociado a tu número.';
        if (new Date() > new Date(vinculo.expiraEn)) throw 'El código de vinculación ha expirado.';

        // Proceder a iniciar el sub-bot usando el código de vinculación
        try {
            await Jadibot(m.sender, conn, m, true); // true para indicar que use pairing code
        } catch (e) {
            throw `Error al vincular el bot: ${e.message}`;
        }

        // Eliminar el código de vinculación después de usarlo
        data.vinculaciones = data.vinculaciones.filter(v => v.codigoVinculacion !== codigoVinculacion);
        writeFileSync(codigosPath, JSON.stringify(data, null, 2));

    } else {
        // Si no se proporciona un código de vinculación, verificar si ya tiene una sesión activa
        let sessionPath = join(authFolder, m.sender.split('@')[0]);

        if (existsSync(sessionPath)) {
            // Si ya existe la sesión, reconectar
            try {
                await Jadibot(m.sender, conn, m, false);
                m.reply('¡Te has reconectado exitosamente como sub-bot!');
            } catch (e) {
                throw `Error al reconectar el bot: ${e.message}`;
            }
        } else {
            // Si no existe sesión, solicitar que canjee un código primero
            m.reply('No tienes una sesión activa. Por favor, canjea un código primero usando el comando:\n*.canjearcodigosb [tu código]*');
        }
    }
};

handler.help = ['serbot'];
handler.tags = ['jadibot'];
handler.command = /^serbot$/i;

export default handler;

