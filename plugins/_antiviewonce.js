// CÓDIGO ADAPTADO POR https://github.com/GataNina-Li | @gata_dios

// Este código maneja mensajes "view once" en WhatsApp, permitiendo al bot descargar y volver a enviar el contenido 
// con mensajes humorísticos. Esto es útil para evitar que se pierda el contenido que solo puede ser visto una vez.

// Importar la función necesaria de Baileys
const { downloadContentFromMessage } = (await import(global.baileys)).default;

export async function before(m, { isAdmin, isBotAdmin }) {
  // Obtener los datos del chat de la base de datos
  let chat = db.data.chats[m.chat];

  // Ignorar ciertos comandos que no deben ser procesados
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;

  // Verificar si la función anti ver está activada o si el chat está prohibido
  if (!chat.antiver || chat.isBanned) return;

  // Verificar si el mensaje es del tipo "viewOnceMessageV2"
  if (m.mtype === 'viewOnceMessageV2') {
    let msg = m.message.viewOnceMessageV2.message;
    let type = Object.keys(msg)[0];

    // Descargar el contenido del mensaje
    let media = await downloadContentFromMessage(msg[type], type === 'imageMessage' ? 'image' : 'video');
    let buffer = Buffer.from([]);

    for await (const chunk of media) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Construir el mensaje de respuesta con un toque humorístico
    let responseText = `${msg[type].caption || ''}\n`;
    if (type === 'videoMessage') {
      responseText += '😂 ¡Oops! Pensaste que no lo veríamos otra vez, ¿eh?';
    } else if (type === 'imageMessage') {
      responseText += '😜 ¡Sorpresa! ¡Esta imagen es nuestra ahora!';
    } else if (type === 'audioMessage') {
      responseText += '🎧 ¡Ups! ¡Hemos capturado tu audio! ¡Escúchalo otra vez!';
    } else if (type === 'documentMessage') {
      responseText += '📄 ¡Ajá! ¡Este documento no es tan secreto ahora!';
    } else {
      responseText += '📦 ¡Archivo capturado! ¡No más secretos!';
    }

    // Enviar el archivo y el mensaje humorístico
    return this.sendFile(m.chat, buffer, `error.${type.split('Message')[0]}`, responseText, m);
  }
}
