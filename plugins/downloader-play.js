import yts from 'yt-search';
import axios from 'axios';

const BASE_URL = 'https://youtube-download-api.matheusishiyama.repl.co';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return await conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué música deseas buscar? Escribe el título o enlace después del comando:\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`,
        m
      );
    }

    // Realizar búsqueda en YouTube
    const results = await yts(text);
    const video = results.videos[0];
    if (!video) throw 'No se encontró el contenido solicitado. Intenta con otro título.';

    const { title, thumbnail, timestamp, views, ago, url } = video;

    // Enviar información inicial
    await conn.reply(
      m.chat,
      `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n⏳ *Duración:* ${timestamp || 'Desconocida'}\n👁️ *Vistas:* ${views || 'Desconocidas'}\n📅 *Publicado:* ${ago || 'Desconocido'}\n🌐 *Enlace:* ${url}\n\n🕒 *Preparando descarga...*`,
      m
    );

    // Descargar MP3
    if (command === 'play') {
      const mp3Url = `${BASE_URL}/mp3/?url=${encodeURIComponent(url)}`;
      await conn.sendMessage(m.chat, {
        audio: { url: mp3Url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        caption: `🎶 *Título:* ${title}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 2,
            mediaUrl: url,
            title: title,
            sourceUrl: url,
            thumbnail: await (await conn.getFile(thumbnail)).data,
          },
        },
      });
    }

    // Descargar video en baja calidad
    if (command === 'playvideo') {
      const mp4Url = `${BASE_URL}/mp4/?url=${encodeURIComponent(url)}`;
      await conn.sendMessage(m.chat, {
        video: { url: mp4Url },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `🎥 *Título:* ${title}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 2,
            mediaUrl: url,
            title: title,
            sourceUrl: url,
            thumbnail: await (await conn.getFile(thumbnail)).data,
          },
        },
      });
    }

    await conn.reply(m.chat, `✅ *¡Descarga completada!*\n\n🔰 *Admin-TK siempre a tu servicio.*`, m);
  } catch (error) {
    console.error('❌ Error en .play:', error.message || error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || 'Ocurrió un problema'}\n\n🔰 *Por favor, intenta nuevamente.*`, m);
  }
};

// Configuración del Handler
handler.command = ['play', 'playvideo'];
handler.help = ['play *<título o enlace>*', 'playvideo *<título o enlace>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
