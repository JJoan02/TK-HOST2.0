import axios from 'axios';

const BASE_URL = 'https://youtube-download-api.matheusishiyama.repl.co';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return await conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas descargar en MP3 o video en baja calidad? Escribe el enlace de YouTube después del comando.\n\n📌 Ejemplo: *${usedPrefix}${command} https://youtu.be/abc123*`,
        m
      );
    }

    // Obtener información del video
    const infoResponse = await axios.get(`${BASE_URL}/info/?url=${encodeURIComponent(text)}`);
    const { title, thumbnail } = infoResponse.data;

    if (!title || !thumbnail) throw 'No se pudo obtener la información del video. Verifica el enlace.';

    // Notificación inicial
    await conn.reply(
      m.chat,
      `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n🕒 *Preparando descarga...*`,
      m
    );

    // Descargar MP3
    if (command === 'play') {
      const mp3Url = `${BASE_URL}/mp3/?url=${encodeURIComponent(text)}`;
      await conn.sendMessage(m.chat, {
        audio: { url: mp3Url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        caption: `🎶 *Título:* ${title}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 2,
            mediaUrl: text,
            title: title,
            sourceUrl: text,
            thumbnail: await (await conn.getFile(thumbnail)).data,
          },
        },
      });
    }

    // Descargar video en baja calidad
    if (command === 'playvideo') {
      const mp4Url = `${BASE_URL}/mp4/?url=${encodeURIComponent(text)}`;
      await conn.sendMessage(m.chat, {
        video: { url: mp4Url },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `🎥 *Título:* ${title}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 2,
            mediaUrl: text,
            title: title,
            sourceUrl: text,
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
handler.command = ['play', 'playvideo']; // Comandos soportados
handler.help = ['play *<enlace>*', 'playvideo *<enlace>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
