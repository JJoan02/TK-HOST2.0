// ===========================================================
// 📌 Actualizado por JoanTK
// ✧ Función: Anti-privado que ignora mensajes no permitidos excepto de propietarios, lista blanca o usuarios registrados.
// ✧ Características principales:
//    - Aplica reglas anti-privado tanto a usuarios registrados como no registrados.
//    - Los propietarios, superadministradores y usuarios en la lista blanca pueden usar el bot sin restricciones.
//    - Envía notificaciones claras para usuarios no registrados y guía sobre cómo registrarse.
// ===========================================================

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
    // Ignorar mensajes del bot o en grupos
    if (m.isBaileys && m.fromMe) return true; // Mensajes internos del bot
    if (m.isGroup) return false; // Ignorar grupos
    if (!m.message) return true; // Ignorar mensajes vacíos

    // Comandos permitidos
    const allowedCommands = /piedra|papel|tijera|estado|verificar|code|jadibot|creadora|bottemporal|grupos|instalarbot|términos|deletebot|eliminarsesion|serbot|verify|register|nombre|edad|genero|pasatiempo|finalizar|registroc|deletesesion/i;

    // Excepciones: Lista blanca de usuarios permitidos a pesar de anti-privado
    const whitelist = [
        '1234567890@s.whatsapp.net',  // Espacio 1
        '0987654321@s.whatsapp.net',  // Espacio 2
    ];

    // Acceso a la configuración del bot
    const botSettings = global.db?.data?.settings?.[conn.user.jid] || {};
    const user = global.db?.data?.users?.[m.sender]; // Verificar si el usuario está registrado

    // Verificar si el anti-privado está activado
    if (botSettings.antiPrivate) {
        // Excepción: Si es Owner o Super Owner, permitir todo
        if (isOwner || isROwner) return false;

        // Excepción: Si el usuario está en la lista blanca, permitir mensaje
        if (whitelist.includes(m.sender)) {
            console.log(`Excepción: Mensaje permitido de @${m.sender.split('@')[0]} (Lista blanca)`);
            return false; // Permitir el mensaje
        }

        // Si el usuario no está registrado
        if (!user) {
            console.log(`Mensaje de usuario no registrado: @${m.sender.split('@')[0]}`);
            await m.reply(
                `✧ Hola @${m.sender.split('@')[0]}, parece que no estás registrado.\n` +
                `Usa el comando *${usedPrefix}register* para registrarte y poder interactuar conmigo.`
            );
            return true; // Ignorar mensaje
        }

        // Verificar si el mensaje coincide con los comandos permitidos
        if (!allowedCommands.test(m.text.toLowerCase().trim())) {
            console.log(`Mensaje ignorado de @${m.sender.split('@')[0]} debido al anti-privado.`);
            await m.reply(
                `✧ Hola @${m.sender.split('@')[0]}, debido a que el *Anti-Privado* está activado, no puedo procesar tu mensaje.\n` +
                `Por favor, usa comandos permitidos o contáctame en el grupo.`
            );
            return true; // Ignorar mensaje
        }
    }

    return false; // Permitir procesar el mensaje si no se aplica ninguna regla de bloqueo
}

export default handler;
