// ===========================================================
// 📌 Actualizado por Admin-TK ✧
// ✦ Función: Verifica si el grupo ha superado su fecha de expiración y si es así, el bot abandona el grupo.
// ✦ Características principales:
//   1. **Verificación de expiración**: Revisa si la fecha de expiración ha pasado.
//   2. **Notificación al grupo**: Envía un mensaje de despedida cuando el tiempo de renta se haya agotado.
//   3. **Automatización**: El bot deja automáticamente el grupo cuando se alcanza la fecha de expiración.
//   4. **Manejo de errores**: Añadido para manejar cualquier fallo en la ejecución.
// ===========================================================

export async function all(m) {
    // Verifica si el mensaje proviene de un grupo
    if (!m.isGroup) return;

    // Obtiene los datos del chat desde la base de datos
    let chats = global.db.data.chats[m.chat];

    // Si no hay fecha de expiración configurada, no realiza ninguna acción
    if (!chats.expired) return true;

    // Manejo de errores: si ocurre un fallo en el proceso, lo capturamos
    try {
        // Verifica si la fecha de expiración ha pasado
        if (+new Date() > chats.expired) {
            // Permite personalizar el mensaje de despedida
            let goodbyeMessage = chats.expiredMessage || '✧ *Adiós a todos* ✧\n
⏳ *La renta del grupo ha finalizado*. Si desean renovar, por favor contacten con el owner para continuar disfrutando del servicio de Admin-TK. ¡Gracias por confiar en nosotros!';
            
            // Notifica en el grupo que la renta ha finalizado
            await this.reply(m.chat, goodbyeMessage);

            // El bot abandona el grupo
            await this.groupLeave(m.chat);

            // Resetea la fecha de expiración en la base de datos
            chats.expired = null;

            return true;
        }
    } catch (error) {
        console.error('❌ Error al verificar la expiración:', error);
        await this.reply(m.chat, '✧ *Hubo un error al intentar verificar la expiración del grupo*. Admin-TK está trabajando para solucionarlo.');
    }

    // Si no ha expirado, no hace nada
    return true;
}

// Comando para cambiar la fecha de expiración de forma dinámica (esto puede estar en un comando separado)
export async function setExpiration(m, newExpirationDate) {
    let chats = global.db.data.chats[m.chat];
    
    try {
        // Establece la nueva fecha de expiración
        chats.expired = newExpirationDate.getTime();  // Establece la nueva fecha
        await this.reply(m.chat, `✧ *La fecha de expiración ha sido actualizada* ✧\n📅 Nueva fecha: ${newExpirationDate.toString()}`);
    } catch (error) {
        console.error('❌ Error al actualizar la fecha de expiración:', error);
        await this.reply(m.chat, '✧ *Hubo un error al intentar actualizar la fecha de expiración*. Admin-TK lo solucionará pronto.');
    }
}

// Comando para reiniciar el contador de expiración si se reactiva el grupo (ej. pago o renovación)
export async function resetExpiration(m) {
    let chats = global.db.data.chats[m.chat];

    try {
        // Reinicia la fecha de expiración
        chats.expired = null;  // Resetea la fecha de expiración
        await this.reply(m.chat, '✧ *¡La renta ha sido renovada!* ✧\n🎉 ¡El grupo sigue activo! Gracias por continuar con Admin-TK. ✨');
    } catch (error) {
        console.error('❌ Error al reiniciar la expiración:', error);
        await this.reply(m.chat, '✧ *Hubo un error al intentar reiniciar la expiración*. Admin-TK está trabajando para solucionarlo.');
    }
}
