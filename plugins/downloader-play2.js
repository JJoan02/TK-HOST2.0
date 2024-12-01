import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return await conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas descargar? Escribe el título o enlace después del comando:\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`,
        m
      );
    }

    // Búsqueda en YouTube
    const results = await yts(text);
    const video = results.videos[0];
    if (!video) throw 'No se encontró el contenido solicitado. Intenta con otro título.';

    const { title, thumbnail, timestamp, views, ago, url } = video;

    // Enviar información inicial
    await conn.reply(
      m.chat,
      `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n⏳ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views}\n📅 *Publicado:* ${ago}\n🌐 *Enlace:* ${url}\n\n🕒 *Preparando descarga...*`,
      m
    );

    // Descargar archivo con API alternativa
    const apiUrl = `https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    const { result } = response.data;
    if (!result) throw 'No se pudo obtener los enlaces de descarga.';

    const audioUrl = result.download.audio;
    const videoUrl = result.download.video;

    if (!audioUrl || !videoUrl) throw 'Error al procesar el contenido.';

    const thumbBuffer = await axios.get(result.thumbnail, { responseType: 'arraybuffer' });

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      jpegThumbnail: thumbBuffer.data,
      caption: `🎥 *${title}*\n📽 *Enlace*: ${url}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
    });

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      jpegThumbnail: thumbBuffer.data,
    });

    await conn.reply(m.chat, `✅ *¡Descarga completada!*\n\n🔰 *Admin-TK siempre a tu servicio.*`, m);
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || error}\n\n🔰 *Por favor, intenta nuevamente.*`, m);
  }
};

handler.command = ['play2', 'playdoc']; // Comandos alternativos
handler.help = ['play2 *<consulta>*', 'playdoc *<consulta>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
