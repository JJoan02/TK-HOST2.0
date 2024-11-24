// ===========================================================
// 📌 Actualizado por JoanTK
// ✧ Función: Anti-privado que ignora mensajes no permitidos excepto de propietarios, lista blanca o usuarios registrados.
// ✧ Características principales:
//    - Aplica reglas anti-privado tanto a usuarios registrados como no registrados.
//    - Los propietarios, superadministradores y usuarios en la lista blanca pueden usar el bot sin restricciones.
//    - Envía notificaciones claras para usuarios no registrados y guía sobre cómo registrarse.
// ===========================================================

export default async function handler(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
    if (m.isBaileys && m.fromMe) return true; // Mensajes internos del bot
    if (m.isGroup) return false; // Ignorar grupos
    if (!m.message) return true; // Ignorar mensajes vacíos

    const allowedCommands = /piedra|papel|tijera|estado|verificar|code|jadibot|creadora|bottemporal|grupos|instalarbot|términos|deletebot|eliminarsesion|serbot|verify|register|nombre|edad|genero|pasatiempo|finalizar|registroc|deletesesion/i;
    const whitelist = ['1234567890@s.whatsapp.net', '0987654321@s.whatsapp.net'];

    const botSettings = global.db?.data?.settings?.[conn.user.jid] || {};
    const user = global.db?.data?.users?.[m.sender];

    if (botSettings.antiPrivate) {
        if (isOwner || isROwner) return false;
        if (whitelist.includes(m.sender)) {
            console.log(`Excepción: Mensaje permitido de @${m.sender.split('@')[0]} (Lista blanca)`);
            return false;
        }

        if (!user) {
            console.log(`Mensaje de usuario no registrado: @${m.sender.split('@')[0]}`);
            await m.reply(
                `✧ Hola @${m.sender.split('@')[0]}, parece que no estás registrado.\n` +
                `Usa el comando *${global.prefix || '.'}register* para registrarte y poder interactuar conmigo.`
            );
            return true;
        }

        if (!allowedCommands.test(m.text.toLowerCase().trim())) {
            console.log(`Mensaje ignorado de @${m.sender.split('@')[0]} debido al anti-privado.`);
            await m.reply(
                `✧ Hola @${m.sender.split('@')[0]}, debido a que el *Anti-Privado* está activado, no puedo procesar tu mensaje.\n` +
                `Por favor, usa comandos permitidos o contáctame en el grupo.`
            );
            return true;
        }
    }

    return false; // Permitir procesar el mensaje si no se aplica ninguna regla de bloqueo
}

