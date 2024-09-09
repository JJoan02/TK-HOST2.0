const userSpamData = {};
let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isPrems }) {
    const chat = global.db.data.chats[m.chat];
    const bot = global.db.data.settings[conn.user.jid] || {};

    if (!bot.antiSpam) return; // Si la función anti-spam no está activada, salir

    if (m.isGroup) {
        if (chat.modoadmin) return; // Si el modo admin está activado, no actuar
        if (!isBotAdmin) return; // El bot necesita ser administrador para actuar
        if (isOwner || isROwner || isAdmin || isPrems) return; // Excepciones para admins, dueño del bot, etc.
    } else {
        if (isOwner || isROwner || isPrems) return; // Excepciones para chats privados
    }

    const sender = m.sender;
    const currentTime = new Date().getTime();
    const timeWindow = 5000; // 5 segundos de ventana de tiempo para el spam
    const messageLimit = 10; // Límite de mensajes en la ventana de tiempo

    // Tiempos de espera para reiniciar los contadores después de cada infracción
    const time = 30000;  // 30 segundos para la primera infracción
    const time2 = 60000; // 1 minuto para la segunda infracción
    const time3 = 120000; // 2 minutos para la tercera infracción

    // Inicializa los datos del usuario si no están ya en el registro
    if (!(sender in userSpamData)) {
        userSpamData[sender] = {
            lastMessageTime: currentTime,
            messageCount: 1,
            antiBan: 0,
            messageWarnings: [0, 0, 0], // Control para las advertencias
        };
    } else {
        const userData = userSpamData[sender];
        const timeDifference = currentTime - userData.lastMessageTime;

        // Verifica el nivel de anti-ban y actúa en consecuencia
        if (userData.antiBan === 1 && userData.messageWarnings[0] === 0) {
            userData.messageWarnings[0]++;
            await conn.reply(m.chat, `⚠️ ¡Ey, @${sender.split('@')[0]}! Tranquilo con los mensajes 😅, estás enviando demasiado rápido. Primera advertencia.`, m, { mentions: [m.sender] });
        } else if (userData.antiBan === 2 && userData.messageWarnings[1] === 0) {
            userData.messageWarnings[1]++;
            await conn.reply(m.chat, `⚠️ @${sender.split('@')[0]}, ¡Otra vez tú! Segunda advertencia ⚡, relájate o te vamos a silenciar.`, m, { mentions: [m.sender] });
        } else if (userData.antiBan === 3 && userData.messageWarnings[2] === 0) {
            userData.messageWarnings[2]++;
            await conn.reply(m.chat, `❌ @${sender.split('@')[0]}, ¡No más advertencias! Te pasaste de la raya 😡, estás fuera del grupo. ¡Hasta la vista! 👋`, m, { mentions: [m.sender] });
            await conn.groupParticipantsUpdate(m.chat, [sender], 'remove'); // Expulsa al usuario
        }

        // Incrementa el contador de mensajes si el tiempo está dentro del límite
        if (timeDifference <= timeWindow) {
            userData.messageCount += 1;

            if (userData.messageCount >= messageLimit) {
                userData.antiBan++; // Incrementa el nivel de anti-ban
                userData.messageCount = 1; // Resetea el contador de mensajes

                // Después de cada infracción, reinicia los contadores tras un tiempo definido
                if (userData.antiBan === 1) {
                    setTimeout(() => resetWarnings(sender, 1), time);
                } else if (userData.antiBan === 2) {
                    setTimeout(() => resetWarnings(sender, 2), time2);
                } else if (userData.antiBan === 3) {
                    setTimeout(() => resetWarnings(sender, 3), time3);
                }
            }
        } else {
            // Si el tiempo ha excedido los 2 segundos entre mensajes, resetea el contador
            if (timeDifference >= 2000) {
                userData.messageCount = 1;
            }
        }

        userData.lastMessageTime = currentTime; // Actualiza el tiempo del último mensaje
    }
};

// Función para resetear advertencias y datos del usuario tras el tiempo de espera
const resetWarnings = (sender, level) => {
    if (userSpamData[sender].antiBan === level) {
        userSpamData[sender].antiBan = 0;
        userSpamData[sender].messageWarnings = [0, 0, 0];
    }
};

export default handler;
