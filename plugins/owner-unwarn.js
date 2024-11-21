// ===========================================================
// 📌 Actualizado por JoanTK
// ✧ Función: Restablecer las advertencias de un usuario a cero.
// ✧ Características principales:
//    - Verifica si se proporciona un usuario válido (mencionado o en chat privado).
//    - Evita errores si el usuario no existe o no tiene advertencias.
//    - Notifica con mensajes personalizados sobre el éxito o error de la operación.
//    - Registra quién realizó la acción, a quién afectó, y cuándo ocurrió.
// ===========================================================

let handler = async (m, { conn, text }) => {
    // Verificar si se proporcionó un usuario
    if (!text) {
        return m.reply('✧ Por favor menciona al usuario después del comando para restablecer sus advertencias.');
    }

    // Determinar el usuario en grupos o chats privados
    let who;
    if (m.isGroup) {
        who = m.mentionedJid[0]; // Obtener el usuario mencionado
    } else {
        who = m.chat; // Enviar en chat privado
    }

    // Verificar si hay un usuario válido
    if (!who) {
        return m.reply('✧ No se pudo identificar al usuario. Asegúrate de mencionarlo correctamente.');
    }

    // Acceder a la base de datos global de usuarios
    let users = global.db.data.users;
    if (!users[who]) {
        return m.reply(`✧ El usuario mencionado no existe en la base de datos.`);
    }

    // Verificar si el usuario ya tiene advertencias
    if (users[who].warning === 0) {
        return m.reply(`✧ El usuario @${who.split('@')[0]} no tiene advertencias para restablecer.`, m.chat, { mentions: [who] });
    }

    // Restablecer advertencias
    users[who].warning = 0;

    // Confirmar acción al ejecutor
    m.reply(`✧ Las advertencias del usuario @${who.split('@')[0]} han sido restablecidas con éxito.`, m.chat, { mentions: [who] });

    // Registro de la acción
    let logEntry = {
        executor: m.sender, // Quién ejecutó el comando
        target: who, // A quién se aplicó
        action: 'reset warnings', // Acción realizada
        date: new Date().toISOString(), // Fecha y hora del evento
    };

    // Registrar la acción (puedes cambiar esta parte según tu sistema de logs)
    if (!global.logs) global.logs = []; // Crear el registro si no existe
    global.logs.push(logEntry);

    // Notificar que el registro fue exitoso (opcional)
    console.log(`Registro guardado:`, logEntry);
};

handler.help = ['unwarn'];
handler.tags = ['owner'];
handler.command = /^unwarn(user)?$/i;
handler.rowner = true; // Solo accesible por el propietario del bot

export default handler;
