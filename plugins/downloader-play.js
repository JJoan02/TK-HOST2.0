import yts from 'yt-search';

const handler = async (m, { conn, usedPrefix, text, command }) => {
  try {
    if (!text) {
      throw `🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas buscar? Escribe el título después del comando.\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`;
    }

    // Reacción de inicio
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

    // Realizar búsqueda en YouTube
    const res = await yts(text);
    const vid = res.videos[0];
    if (!vid) {
      throw '❌ No se encontraron resultados. Intenta con otro término.';
    }

    const { title, thumbnail, timestamp, views, ago, url } = vid;

    // Mostrar información del video
    const videoInfo = `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n⏳ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views.toLocaleString()}\n📅 *Publicado:* ${ago}\n🌐 *Enlace:* ${url}\n\n🕒 *Selecciona una opción de descarga:*`;

    // Enviar botones con opciones
    const buttons = [
      { buttonId: `${usedPrefix}fgmp3 ${url}`, buttonText: { displayText: '💿 Descargar MP3' }, type: 1 },
      { buttonId: `${usedPrefix}fgmp4 ${url}`, buttonText: { displayText: '📀 Descargar MP4' }, type: 1 },
      { buttonId: `${usedPrefix}ytmp3doc ${url}`, buttonText: { displayText: '📁 MP3 Documento' }, type: 1 },
      { buttonId: `${usedPrefix}ytmp4doc ${url}`, buttonText: { displayText: '📁 MP4 Documento' }, type: 1 }
    ];

    const buttonMessage = {
      image: { url: thumbnail },
      caption: videoInfo,
      footer: '🔰 Admin-TK Downloader',
      buttons: buttons,
      headerType: 4
    };

    await conn.sendMessage(m.chat, buttonMessage);
  } catch (error) {
    console.error(error.message || error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || 'Algo salió mal.'}`, m);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = ['play', 'playvid'];
handler.disabled = false;

export default handler;
