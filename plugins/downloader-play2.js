import axios from 'axios';
import yts from 'yt-search';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return await handleMissingQuery(m, conn, usedPrefix, command);
  }

  try {
    const initialMessage = await sendInitialMessage(m, conn);
    const videoData = await searchVideo(text);
    if (!videoData || videoData.duration.seconds === 0) {
      return await handleNoResultsOrInvalidVideo(m, conn, initialMessage);
    }

    await updateMessage(m, conn, initialMessage, `🎬 *Buscando video...*\n🔰 *Título:* ${videoData.title}\n⏳ *Duración:* ${videoData.duration.timestamp}\n👁️ *Vistas:* ${videoData.views}\n📅 *Publicado:* ${videoData.ago}`);

    const { videoUrl, audioUrl, thumbBuffer } = await downloadMediaWithQualityControl(videoData.url, text);
    if (!videoUrl) {
      return await handleDownloadError(m, conn, initialMessage, 'No se pudo obtener la URL del video. Por favor inténtalo de nuevo.');
    }

    // Descargar y enviar el video
    await updateMessage(m, conn, initialMessage, '🎥 *Descargando video...*');
    await sendVideoFile(m, conn, videoData, videoUrl, thumbBuffer);
    await updateMessage(m, conn, initialMessage, '✅ *Video descargado con éxito...*');

    // Descargar y enviar el audio
    if (!audioUrl) {
      return await handleDownloadError(m, conn, initialMessage, 'No se pudo obtener la URL del audio. Por favor inténtalo de nuevo.');
    }

    await updateMessage(m, conn, initialMessage, '🎶 *Descargando audio...*');
    await sendAudioFile(m, conn, videoData, audioUrl, thumbBuffer);
    await updateMessage(m, conn, initialMessage, '✅ *Audio descargado con éxito...*');
  } catch (error) {
    console.error('Error en el proceso:', error);
    await handleUnexpectedError(m, conn, initialMessage);
  }
};

// Manejo de errores comunes
async function handleMissingQuery(m, conn, usedPrefix, command) {
  await conn.sendMessage(m.chat, {
    text: `⚠️ Necesitas proporcionar una consulta de búsqueda.\n\nEjemplo: *${usedPrefix}${command} Rosa pastel Belanova*`,
  }, { quoted: m });
}

async function handleNoResultsOrInvalidVideo(m, conn, initialMessage) {
  await updateMessage(m, conn, initialMessage, '❌ No se encontraron resultados o el video es inválido. Por favor intenta con otra consulta.');
}

async function handleDownloadError(m, conn, initialMessage, message) {
  await updateMessage(m, conn, initialMessage, `❌ ${message}`);
}

async function handleUnexpectedError(m, conn, initialMessage) {
  await updateMessage(m, conn, initialMessage, '⚠️ Ha ocurrido un error inesperado. Por favor intenta nuevamente más tarde.');
}

// Enviar mensaje inicial
async function sendInitialMessage(m, conn) {
  const initialMessage = await conn.sendMessage(m.chat, { text: '✧ *Espere un momento...*' }, { quoted: m });
  return initialMessage;
}

// Actualizar mensaje existente
async function updateMessage(m, conn, initialMessage, newText) {
  await conn.sendMessage(m.chat, { text: newText, edit: initialMessage.key });
}

// Buscar video en YouTube
async function searchVideo(query) {
  const results = await yts(query);
  return results.videos[0];
}

// Descargar video y audio
async function downloadMediaWithQualityControl(url, text) {
  const qualities = ['1080p', '720p', '480p', '360p', '240p', '144p'];
  for (let quality of qualities) {
    try {
      const res = await axios.get(`https://example-api.com/yt?query=${encodeURIComponent(text)}&quality=${quality}`);
      const video = res.data.result;
      if (!video || video.duration.seconds === 0) throw new Error('Video inválido');

      const audioUrl = video.download.audio;
      const videoUrl = video.download.video;
      const thumbBuffer = await getBuffer(video.thumbnail);
      return { audioUrl, videoUrl, thumbBuffer };
    } catch (error) {
      console.error(`Error al intentar descargar en calidad ${quality}:`, error.message);
    }
  }
  throw new Error('No se pudo descargar el video en ninguna calidad disponible.');
}

// Obtener buffer de miniatura
async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return res.data;
}

// Enviar archivo de video
async function sendVideoFile(m, conn, videoData, videoUrl, thumbBuffer) {
  const videoDoc = {
    video: { url: videoUrl },
    mimetype: 'video/mp4',
    fileName: `${videoData.title}.mp4`,
    jpegThumbnail: thumbBuffer,
    caption: `🎥 *${videoData.title}*\n📽 *Fuente:* ${videoData.url}`,
  };
  await conn.sendMessage(m.chat, videoDoc, { quoted: m });
}

// Enviar archivo de audio
async function sendAudioFile(m, conn, videoData, audioUrl, thumbBuffer) {
  const audioDoc = {
    audio: { url: audioUrl },
    mimetype: 'audio/mpeg',
    fileName: `${videoData.title}.mp3`,
    jpegThumbnail: thumbBuffer,
  };
  await conn.sendMessage(m.chat, audioDoc, { quoted: m });
}

handler.help = ['play2 *<consulta>*', 'playvideo *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play2|playvideo)$/i;

export default handler;
