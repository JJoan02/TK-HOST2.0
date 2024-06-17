// CÓDIGO ADAPTADO POR https://github.com/GataNina-Li | @gata_dios

// Este código maneja la actualización del estado del perfil del bot en WhatsApp, mostrando el tiempo de actividad 
// y otros mensajes personalizados. Es útil para mantener a los usuarios informados sobre el estado y la disponibilidad del bot.

let handler = m => m;

// Función para manejar todos los mensajes recibidos por el bot
handler.all = async function (m) {
  // Obtener la configuración global del bot
  let setting = global.db.data.settings[this.user.jid];

  // Calcular el tiempo de actividad del bot
  let _uptime = process.uptime() * 1000;
  let _muptime;
  if (process.send) {
    process.send('uptime');
    _muptime = await new Promise(resolve => { 
      process.once('message', resolve);
      setTimeout(resolve, 2000); 
    }) * 1000;
  }
  let uptime = clockString(_uptime);

  // Construir el mensaje de estado para el bot principal
  let mainBotBio = `${global.packname} ⁝⁝ ✅ ${uptime} ⌛ ⁝⁝ 𓃠 ${lenguajeGB.lenguaje() == 'es' ? '#estado #menu #serbot #grupos #creadora' : '#status #menu #jadibot #groupsgb #owner'} 💻 By: GLOBAL-GB`;

  // Construir el mensaje de estado para los subbots
  let subBotBio = `${global.packname} Subbot ⁝⁝ ✅ ${uptime} ⌛ ⁝⁝ 𓃠 ${lenguajeGB.lenguaje() == 'es' ? '#estado #subbot #menu #serbot' : '#status #subbot #menu #jadibot'} 💻 By: Subbot-GB`;

  // Determinar si es el bot principal o un subbot y actualizar el estado del perfil
  if (this.user.jid === 'bot-principal@whatsapp.net') {  // Reemplaza con el JID real del bot principal
    await this.updateProfileStatus(mainBotBio).catch(_ => _);
  } else {
    await this.updateProfileStatus(subBotBio).catch(_ => _);
  }

  // Actualizar la hora de la última actualización del estado
  setting.status = new Date() * 1;
};

// Función para convertir milisegundos a una cadena de tiempo legible
function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, ' días ', h, ' horas ', m, ' minutos ', s, ' segundos'].map(v => v.toString().padStart(2, 0)).join('');
}

export default handler;
