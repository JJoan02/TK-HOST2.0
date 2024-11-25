// plugins/__serbot.js
import { openDb } from '../data/codigos.js';
import { Jadibot } from '../lib/jadibot.js';
import { authFolder } from '../lib/jadibots.js';
import { existsSync } from 'fs';
import { join } from 'path';

let handler = async (m, { conn, args }) => {
    let codigoVinculacion = args[0];
    let db = await openDb();

    // Limpiar códigos expirados antes de proceder
    await limpiarCodigosExpirados(db);

    if (codigoVinculacion) {
        // El usuario ingresa un código de vinculación
        let vinculo = await db.get('SELECT * FROM vinculaciones WHERE codigoVinculacion = ? AND usuario = ?', [codigoVinculacion, m.sender]);

        if (!vinculo) throw '❌ Código de vinculación inválido o no está asociado a tu número.';
        if (new Date() > new Date(vinculo.expiraEn)) {
            // Eliminar código de vinculación expirado
            await db.run('DELETE FROM vinculaciones WHERE codigoVinculacion = ?', [codigoVinculacion]);
            throw '❌ El código de vinculación ha expirado.';
        }

        // Proceder a iniciar el sub-bot usando el código de vinculación
        try {
            await Jadibot(m.sender, conn, m, true);

            // Registrar inicio de sesión
            await db.run('INSERT INTO sesiones (usuario, inicio, fin) VALUES (?, ?, NULL)', [m.sender, new Date().toISOString()]);

            // Notificar al owner
            let ownerJid = 'owner_number@s.whatsapp.net'; // Reemplaza con el número del owner
            await conn.sendMessage(ownerJid, {
                text: `🔔 Sub-Bot Conectado: @${m.sender.split('@')[0]}`,
                mentions: [m.sender]
            });
        } catch (e) {
            throw `❌ Error al vincular el bot: ${e.message}`;
        }

        // Eliminar el código de vinculación después de usarlo
        await db.run('DELETE FROM vinculaciones WHERE codigoVinculacion = ?', [codigoVinculacion]);

    } else {
        // Verificar si ya tiene una sesión activa
        let sessionPath = join(authFolder, m.sender.split('@')[0]);

        if (existsSync(sessionPath)) {
            // Re-conectar el sub-bot
            try {
                await Jadibot(m.sender, conn, m, false);
                m.reply('✅ ¡Te has reconectado exitosamente como sub-bot!');

                // Registrar reconexión
                await db.run('INSERT INTO sesiones (usuario, inicio, fin) VALUES (?, ?, NULL)', [m.sender, new Date().toISOString()]);

                // Notificar al owner
                let ownerJid = 'owner_number@s.whatsapp.net'; // Reemplaza con el número del owner
                await conn.sendMessage(ownerJid, {
                    text: `🔔 Sub-Bot Reconectado: @${m.sender.split('@')[0]}`,
                    mentions: [m.sender]
                });
            } catch (e) {
                throw `❌ Error al reconectar el bot: ${e.message}`;
            }
        } else {
            // Solicitar que canjee un código primero
            m.reply('❌ No tienes una sesión activa. Por favor, canjea un código primero usando el comando:\n*.canjearcodigosb [tu código]*\n\nSi necesitas ayuda, utiliza el comando *.ayudasubbot*.');
        }
    }
};

async function limpiarCodigosExpirados(db) {
    const ahora = new Date().toISOString();

    // Marcar códigos expirados
    await db.run('UPDATE codigos SET expirado = 1 WHERE expiraEn <= ?', [ahora]);

    // Eliminar vinculaciones expiradas
    await db.run('DELETE FROM vinculaciones WHERE expiraEn <= ?', [ahora]);
}

handler.command = /^serbot$/i;
export default handler;

