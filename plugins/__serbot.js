// plugins/__serbot.js
import { generarCodigoVinculacion } from '../lib/jadibots.js';
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Verificar si el usuario proporcionó un código
    if (!args[0]) {
        return conn.sendMessage(m.chat, { text: 'Por favor, proporciona el código de vinculación de 8 dígitos. Ejemplo: .serbot 12345678' }, { quoted: m });
    }

    let codigoVinculacion = args[0].trim();

    // Validar que el código tenga 8 dígitos
    if (!/^\d{8}$/.test(codigoVinculacion)) {
        return conn.sendMessage(m.chat, { text: 'El código de vinculación debe tener exactamente 8 dígitos.' }, { quoted: m });
    }

    let db = await openDb();
    let vinculacion = await db.get(`SELECT * FROM vinculaciones WHERE codigoVinculacion = ? AND utilizado = 0 AND expiraEn > ?`, [codigoVinculacion, new Date().toISOString()]);

    if (!vinculacion) {
        return conn.sendMessage(m.chat, { text: 'El código de vinculación es inválido o ha expirado.' }, { quoted: m });
    }

    // Marcar la vinculación como utilizada
    await db.run(`UPDATE vinculaciones SET utilizado = 1 WHERE id = ?`, [vinculacion.id]);

    // Registrar la sesión en la base de datos
    await db.run(`INSERT INTO sesiones (usuario, inicio) VALUES (?, ?)`, [m.sender, new Date().toISOString()]);

    // Aquí debes inicializar la sesión del sub-bot, esto dependerá de cómo manejas las conexiones en tu bot
    // Supongo que tienes una función para iniciar una nueva sesión, por ejemplo:
    try {
        // Iniciar la sesión del sub-bot
        // Esta es una función ficticia que debes reemplazar con tu lógica real
        await iniciarSubBot(m.sender);
        conn.sendMessage(m.chat, { text: '¡Vinculación exitosa! Tu sub-bot está ahora activo.' }, { quoted: m });

        // Notificar al owner sobre la nueva vinculación
        let ownerJid = 'owner_number@s.whatsapp.net'; // Reemplaza con el número del owner en formato internacional
        await conn.sendMessage(ownerJid, {
            text: `🔔 Nuevo Sub-Bot Vinculado: @${m.sender.split('@')[0]}`,
            mentions: [m.sender]
        });
    } catch (error) {
        console.error('Error al iniciar el sub-bot:', error);
        conn.sendMessage(m.chat, { text: 'Hubo un error al iniciar tu sub-bot. Por favor, intenta nuevamente más tarde.' }, { quoted: m });
    }
};

// Función para iniciar la sesión del sub-bot
// Debes implementar esta función según la lógica de tu bot
async function iniciarSubBot(usuario) {
    // Implementa la lógica para iniciar una nueva sesión de sub-bot
    // Por ejemplo, podrías forkear un nuevo proceso, usar una conexión diferente, etc.
    // Este es un ejemplo básico usando cluster:
    const { fork } = await import('child_process');
    const path = await import('path');
    const subBotPath = path.join(__dirname, '../lib/subbot.js'); // Ruta al script del sub-bot

    const subBot = fork(subBotPath, [usuario]);

    // Guarda la referencia al sub-bot si es necesario
    // Puedes usar una estructura global o una base de datos para rastrear sub-bots activos

    console.log(`Sub-Bot iniciado para ${usuario}`);
}

handler.help = ['serbot <codigo>'];
handler.tags = ['jadibot'];
handler.command = /^serbot$/i;

export default handler;
