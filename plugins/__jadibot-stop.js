// plugins/__stopjadibot.js
import { openDb } from '../data/codigos.js';
import { fork } from 'child_process';
import path from 'path';

let handler = async (m, { conn, isOwner, args }) => {
    let usuario = m.sender;

    if (!isOwner && usuario !== m.sender) {
        throw '*[❗] Solo el owner o el usuario del sub-bot puede usar este comando.*';
    }

    let db = await openDb();
    let sesion = await db.get(`SELECT * FROM sesiones WHERE usuario = ? AND fin IS NULL`, [usuario]);

    if (!sesion) {
        return conn.sendMessage(m.chat, { text: 'No tienes una sesión activa para detener.' }, { quoted: m });
    }

    // Actualizar la hora de finalización de la sesión
    await db.run(`UPDATE sesiones SET fin = ? WHERE id = ?`, [new Date().toISOString(), sesion.id]);

    // Terminar el proceso del sub-bot
    // Esto asume que tienes una forma de rastrear los sub-bots activos, por ejemplo, en una estructura global
    // Puedes implementar una forma de guardar los procesos forked en un Map o similar

    // Ejemplo básico usando un archivo de registro (debes implementar una mejor gestión)
    // NOTA: Este es un ejemplo simplificado
    // Asegúrate de tener una manera más robusta de manejar los procesos de sub-bot

    // Ruta al archivo subbot.js
    let subBotPath = path.join(__dirname, '../lib/subbot.js');
    // Buscar el proceso del sub-bot y matarlo
    // Esto es solo un ejemplo y puede no funcionar según tu implementación
    // Necesitas una referencia real al proceso del sub-bot
    // Puedes implementar una gestión de procesos en lib/jadibots.js

    // Enviar una notificación al sub-bot para que cierre la sesión
    // Aquí asumo que tienes una forma de comunicarte con el sub-bot, por ejemplo, a través de IPC o sockets
    // Este código es solo ilustrativo y necesita ser adaptado a tu implementación

    conn.sendMessage(m.chat, { text: 'Tu sub-bot ha sido desconectado exitosamente.' }, { quoted: m });

    // Nota: Implementa la lógica real para cerrar la sesión del sub-bot
    // Esto podría implicar enviar un mensaje específico o cerrar el proceso directamente
};

handler.help = ['stopjadibot'];
handler.tags = ['jadibot'];
handler.command = /^stopjadibot$/i;

export default handler;
