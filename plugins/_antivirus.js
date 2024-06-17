// CÓDIGO ADAPTADO POR https://github.com/GataNina-Li | @gata_dios

// Este código maneja mensajes que no se pueden ver en el escritorio en un chat grupal de WhatsApp. 
// Si se detecta un mensaje de este tipo, el bot intenta borrarlo y envía un mensaje humorístico al grupo.

// Función principal para manejar todos los mensajes recibidos por el bot
let handler = m => m;

// Función para manejar todos los mensajes recibidos por el bot
handler.all = async function (m, { isBotAdmin }) { 
  // Verificar si el mensaje tiene un tipo especial (68: mensaje no visible en escritorio)
  if (m.messageStubType === 68) {
    // Verificar si el bot es administrador del grupo
    if (!isBotAdmin) {
      console.log('El bot no tiene permisos de administrador para modificar el chat.');
      return;
    }
    
    // Registro del mensaje a borrar
    let log = {
      key: m.key,
      content: m.msg,
      sender: m.sender
    };
    console.log('Mensaje no visible detectado:', log);

    // Mensajes humorísticos al detectar un mensaje no visible
    const humorousMessages = [
      '🔍 ¡Ah, un mensaje fantasma! 👻 Vamos a eliminarlo...',
      '💥 ¡Kaboom! 💣 Mensaje secreto destruido...',
      '🚫 ¡Alerta! Mensaje invisible detectado y borrado. 🕵️‍♂️',
      '🧹 ¡Limpieza en progreso! 🚮 Despídete del mensaje oculto.',
      '👀 ¡Ups! Alguien intentó esconder un mensaje... pero no conmigo. 😎'
    ];
    // Seleccionar un mensaje humorístico aleatorio
    const randomMessage = humorousMessages[Math.floor(Math.random() * humorousMessages.length)];
    // Enviar el mensaje humorístico al chat
    await this.sendMessage(m.chat, randomMessage);

    // Intentar borrar el mensaje del chat
    try {
      await this.modifyChat(m.chat, 'clear', {
        includeStarred: false
      });
      console.log('Mensaje borrado exitosamente.');
    } catch (error) {
      console.error('Error al borrar el mensaje:', error);
    }
  }
};

export default handler;
