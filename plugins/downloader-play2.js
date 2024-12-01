import axios from 'axios';

const BASE_URL = 'https://youtube-download-api.matheusishiyama.repl.co';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) {
      return await conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas descargar en alta calidad? Escribe el título o enlace después del comando.\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`,
        m
      );
    }

    // Reacción: Procesando
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

    // Obtener información del video
    await conn.reply(m.chat, '🔍 *Buscando información del video...*', m);
    const infoResponse = await axios.get(`${BASE_URL}/info/?url=${encodeURIComponent(text)}`);
    const videoInfo = infoResponse.data;

    if (!videoInfo || !videoInfo.title) {
      throw '❌ No se pudo obtener información del video. Verifica el enlace o título.';
    }

    const { title, thumbnail } = videoInfo;

    // Mostrar información del video
    await conn.reply(
      m.chat,
      `🎥 *Título:* ${title}\n🖼️ *Thumbnail:* ${thumbnail}\n\n⏳ *Preparando descargas...*\n`,
      m
    );

    // Descargar video en calidad 1080p, 720p, 480p o 360p
    const qualities = ['1080', '720', '480', '360'];
    let videoUrl;
    for (const quality of qualities) {
      try {
        await conn.reply(m.chat, `📹 *Intentando descargar en calidad ${quality}p...*`, m);
        videoUrl = `${BASE_URL}/mp4/?url=${encodeURIComponent(text)}&quality=${quality}`;
        await axios.head(videoUrl); // Verifica si el enlace es válido
        break;
      } catch (err) {
        console.error(`❌ Calidad ${quality}p no disponible.`);
      }
    }

    if (!videoUrl) throw '❌ No se pudo descargar el video en ninguna calidad.';

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${title}_${qualities.join('_')}.mp4`,
      caption: `🎥 *Título:* ${title}\n📺 *Calidad:* ${qualities.join('p o ')}p\n\n🔰 *Video descargado por Admin-TK*`,
    });

    // Descargar audio en formato MP3
    await conn.reply(m.chat, '🎶 *Descargando el audio en formato MP3...*', m);
    const audioUrl = `${BASE_URL}/mp3/?url=${encodeURIComponent(text)}`;
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `🎶 *Título:* ${title}\n\n🔰 *Audio descargado por Admin-TK*`,
    });

    // Confirmar finalización
    await conn.reply(m.chat, `✅ *Descarga completada!*\n\n🔰 *Admin-TK siempre a tu servicio.*`, m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('❌ Error en .play2:', error.message || error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || 'Ocurrió un problema inesperado.'}`, m);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.command = ['play2'];
handler.help = ['play2 *<título o enlace>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
