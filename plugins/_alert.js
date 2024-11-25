let handler = m => m;

handler.before = async function (m) {
    try {
        // 🚫 Ignorar mensajes de grupos
        if (m.isGroup) return;

        // Acceder al usuario
        let user = global.db.data.users[m.sender];
        if (!user) {
            console.error('⚠️ Usuario no encontrado en la base de datos.');
            return;
        }

        // Verificar si el usuario está baneado
        if (user.banned) {
            let now = Date.now();
            // Notificar al usuario cada 24 horas si sigue baneado
            if (!user.lastNotified || now - user.lastNotified > 86400000) {
                user.lastNotified = now;

                let banReason = user.banReason || '❌ No se proporcionó ninguna razón.';
                await m.reply(`🚫 *Lo sentimos, has sido baneado por Admin-TK* 🚫\n\n😔 Hola, soy Admin-TK. Tu número ha sido baneado y no podrás usar mis servicios por el momento.\n\n*✧ Razón:* ${banReason}\n\n📞 Si crees que esto es un error, por favor, contacta con el soporte de Admin-TK para más información. 🛠️ Estamos aquí para ayudarte.`);
            }
            return;
        }
    } catch (error) {
        console.error('❗ Error en el manejador del mensaje:', error);
    }
}

export default handler;
