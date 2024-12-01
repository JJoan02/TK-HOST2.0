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

    await conn.sendButton(m.chat, videoInfo, '🔰 Admin-TK', thumbnail, [
      ['💿 Descargar MP3', `${usedPrefix}fgmp3 ${url}`],
      ['📀 Descargar MP4', `${usedPrefix}fgmp4 ${url}`],
      ['📁 MP3 Documento', `${usedPrefix}ytmp3doc ${url}`],
      ['📁 MP4 Documento', `${usedPrefix}ytmp4doc ${url}`]
    ], null, [['🐈‍⬛ Canal Oficial', `${usedPrefix}canal`]], m);
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
