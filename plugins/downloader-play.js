import yts from 'yt-search';
import axios from 'axios';

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

    // Validar que los valores necesarios estén definidos
    if (!title || !url) {
      throw 'Error en la búsqueda: no se encontraron datos válidos del video.';
    }

    // Enviar información inicial al usuario
    await conn.reply(
      m.chat,
      `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n⏳ *Duración:* ${timestamp || 'Desconocida'}\n👁️ *Vistas:* ${views || 'Desconocidas'}\n📅 *Publicado:* ${ago || 'Desconocido'}\n🌐 *Enlace:* ${url}\n\n🕒 *Preparando descarga...*`,
      m
    );

    // Descargar música MP3 utilizando la API de cuka
    const baseUrl = 'https://cuka.rfivecode.com';
    const response = await axios.post(
      `${baseUrl}/download`,
      { url, format: 'mp3' },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.data.success) {
      throw `Error en la descarga: ${response.data.message}`;
    }

    const { downloadUrl } = response.data;

    // Validar que la URL de descarga esté definida
    if (!downloadUrl) {
      throw 'Error al obtener la URL de descarga del MP3.';
    }

    // Enviar archivo MP3
    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `🎶 *Título:* ${title}\n📅 *Publicado:* ${ago || 'Desconocido'}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
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

    await conn.reply(m.chat, `✅ *¡Descarga completada!*\n\n🔰 *Admin-TK siempre a tu servicio.*`, m);
  } catch (error) {
    console.error('❌ Error en .play:', error);
    await conn.reply(
      m.chat,
      `❌ *Error:* ${error.message || error}\n\n🔰 *Por favor, intenta nuevamente.*`,
      m
    );
  }
};

// Configuración del Handler
handler.command = ['play']; // Comando para descargar música MP3
handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
