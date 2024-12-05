import axios from 'axios';
import yts from 'yt-search';

const MAX_SIZE_MB = 200;

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `🔰 Admin-TK: Por favor, envía el enlace del video de YouTube junto al comando.\n\n✦ Ejemplo:\n> ${usedPrefix + command} https://youtube.com/watch?v=kGobHQ7z8X4`
    );
  }

  try {
    let results = await yts(text);
    let videoInfo = results.all[0];

    if (!videoInfo) {
      return m.reply('🔰 Admin-TK: No se encontró ningún video con esa búsqueda.');
    }

    await conn.sendMessage(m.chat, { text: '🔰 Admin-TK: Procesando solicitud...' });

    const response = await axios.get(`https://api.zenkey.my.id/api/download/ytmp4?url=${videoInfo.url}&apikey=zenkey`);
    const { result } = response.data;

    if (!result || !result.content || !result.content[0]) {
      throw new Error('No se pudo procesar el enlace.');
    }

    const suitableVideos = result.content.filter(video => video.size && video.size <= MAX_SIZE_MB * 1024 * 1024);

    if (suitableVideos.length === 0) {
      throw new Error('No hay videos disponibles menores o iguales a 200 MB.');
    }

    const selectedVideo = suitableVideos[0];
    await conn.sendMessage(
      m.chat,
      {
        document: { url: selectedVideo.mediaLink },
        caption: `🔰 Admin-TK: Video descargado con éxito.\n\n🎥 Título: ${selectedVideo.title}`,
        mimetype: 'video/mp4',
        fileName: `${selectedVideo.title}.mp4`,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    m.reply(`🔰 Admin-TK: Error al procesar tu solicitud.\n\n✦ Detalle del error: ${error.message}`);
  }
};

handler.help = ['ytmp4 *<link>*', 'ytvdoc *<link>*'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|ytvdoc)$/i;

export default handler;
