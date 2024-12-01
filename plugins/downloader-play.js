import yts from 'yt-search';
import axios from 'axios';

const BASE_URL = 'https://youtube-download-api.matheusishiyama.repl.co';

const handler = async (m, { conn, usedPrefix, text, command }) => {
  try {
    // Verificar si el texto está vacío
    if (!text) {
      return await conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas descargar? Escribe el título o enlace después del comando.\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`,
        m
      );
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
    await conn.reply(
      m.chat,
      `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n⏳ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views.toLocaleString()}\n📅 *Publicado:* ${ago}\n🌐 *Enlace:* ${url}\n\n🕒 *Preparando descarga...*`,
      m
    );

    // Descargar video en calidad 480p o 360p
    const qualities = ['480', '360'];
    let videoUrl;
    for (const quality of qualities) {
      try {
        await conn.reply(m.chat, `📹 *Intentando descargar el video en calidad ${quality}p...*`, m);
        videoUrl = `${BASE_URL}/mp4/?url=${encodeURIComponent(url)}&quality=${quality}`;
        await axios.head(videoUrl); // Verifica si el enlace es válido
        break;
      } catch (err) {
        console.error(`❌ Calidad ${quality}p no disponible.`);
      }
    }

    if (!videoUrl) throw '❌ No se pudo descargar el video en ninguna calidad disponible.';

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${title}_480p_or_360p.mp4`,
      caption: `🎥 *Título:* ${title}\n📺 *Calidad:* 480p o 360p\n\n🔰 *Video descargado por Admin-TK*`,
    });

    // Descargar audio en formato MP3
    await conn.reply(m.chat, '🎶 *Descargando el audio en formato MP3...*', m);
    const audioUrl = `${BASE_URL}/mp3/?url=${encodeURIComponent(url)}`;
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
    console.error('❌ Error en .play:', error.message || error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || 'Algo salió mal.'}`, m);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.command = ['play'];
handler.help = ['play *<título o enlace>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
