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

    // Notificación inicial
    await conn.reply(
      m.chat,
      `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n⏳ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views}\n📅 *Publicado:* ${ago}\n🌐 *Enlace:* ${url}\n\n🕒 *Preparando descarga...*`,
      m
    );

    // Determinar formato
    const isVideo = /video/i.test(command);
    const format = isVideo ? 'mp4' : 'mp3';
    const baseUrl = 'https://cuka.rfivecode.com';

    // Descargar archivo
    const response = await axios.post(`${baseUrl}/download`, { url, format }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.data.success) throw `Error: ${response.data.message}`;

    const { downloadUrl } = response.data;
    const mimetype = isVideo ? 'video/mp4' : 'audio/mpeg';
    const fileType = isVideo ? 'video' : 'audio';
    const fileName = `${title}.${format}`;

    // Enviar archivo al usuario
    await conn.sendMessage(m.chat, {
      [fileType]: { url: downloadUrl },
      mimetype,
      fileName,
      caption: `🎶 *Título:* ${title}\n📅 *Publicado:* ${ago}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
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
    console.error(error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || error}\n\n🔰 *Por favor, intenta nuevamente.*`, m);
  }
};

handler.command = ['play', 'playvideo']; // Comandos soportados
handler.help = ['play *<consulta>*', 'playvideo *<consulta>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
