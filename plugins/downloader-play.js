import axios from 'axios';
import yts from 'yt-search';
import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return await handleMissingQuery(m, conn, usedPrefix, command);
  }

  try {
    const initialMessage = await sendInitialMessage(m, conn);
    const videoData = await searchVideo(text);
    if (!videoData) {
      return await handleNoResults(m, conn);
    }

    await updateVideoInfo(m, conn, initialMessage, videoData);

    if (command === 'play') {
      const { audioUrl, videoUrl, thumbBuffer } = await downloadMedia(videoData.url, text);
      if (!audioUrl) {
        return await handleDownloadError(m, conn, 'No se pudo obtener la URL del audio. Por favor inténtalo de nuevo.');
      }
      await updateDownloadStatus(m, conn, initialMessage, videoData, 'Audio descargado...');
      await sendAudioFile(m, conn, videoData, audioUrl, thumbBuffer);
    } else if (command === 'playvideo') {
      const { audioUrl, videoUrl, thumbBuffer } = await downloadMedia(videoData.url, text);
      if (!videoUrl) {
        return await handleDownloadError(m, conn, 'No se pudo obtener la URL del video. Por favor inténtalo de nuevo.');
      }
      await updateDownloadStatus(m, conn, initialMessage, videoData, 'Video descargado...');
      await sendVideoFile(m, conn, videoData, videoUrl, thumbBuffer);
    }
  } catch (error) {
    console.error('Error en el proceso:', error);
    await handleUnexpectedError(m, conn);
  }
};

// Handlers de errores comunes y manejo de mensajes
async function handleMissingQuery(m, conn, usedPrefix, command) {
  await conn.sendMessage(m.chat, {
    text: `⚠️ *Admin-TK:*
Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *.${command} Rosa pastel Belanova*`
  }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
}

async function handleNoResults(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.'
  }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
}

async function handleDownloadError(m, conn, message) {
  await conn.sendMessage(m.chat, {
    text: message
  }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
}

async function handleUnexpectedError(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '⚠️ *Admin-TK:* Ha ocurrido un error inesperado. Por favor intenta nuevamente más tarde.'
  }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
}

// Enviar mensaje inicial indicando que se está procesando
async function sendInitialMessage(m, conn) {
  let initialMessage = await conn.sendMessage(m.chat, {
    text: '✧ Espere un momento...'
  }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  return initialMessage;
}

// Buscar el video en YouTube
async function searchVideo(query) {
  let results = await yts(query);
  return results.videos[0];
}

// Editar mensaje con la información del video
async function updateVideoInfo(m, conn, initialMessage, videoData) {
  await conn.sendMessage(m.chat, {
    text: `🔰 *Admin-TK Downloader*

🎵 *Título:* ${videoData.title}
⏳ *Duración:* ${videoData.duration.timestamp}
👁️ *Vistas:* ${videoData.views}
📅 *Publicado:* ${videoData.ago}
🌐 *Enlace:* ${videoData.url}

🕒 *Preparando descarga...*`,
    edit: initialMessage.key
  });
}

// Descargar audio/video usando la API
async function downloadMedia(url, text) {
  try {
    const res = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`);
    const video = res.data.result;
    if (!video) throw new Error('Video/Audio no encontrado');
    if (video.duration.seconds >= 3600) throw new Error('El audio es demasiado largo!');

    const audioUrl = video.download.audio;
    const videoUrl = video.download.video;
    if (!audioUrl || !videoUrl) throw new Error('No se pudo obtener la URL de audio/vídeo. Por favor inténtalo de nuevo.');

    const thumbBuffer = await getBuffer(video.thumbnail);
    return { audioUrl, videoUrl, thumbBuffer };
  } catch (error) {
    console.error('Error al descargar el medio:', error.message);
    throw error;
  }
}

async function getBuffer(url) {
  const res = await axios({
    method: 'get',
    url,
    responseType: 'arraybuffer'
  });
  return res.data;
}

// Editar mensaje indicando que el medio ha sido descargado
async function updateDownloadStatus(m, conn, initialMessage, videoData, status) {
  await conn.sendMessage(m.chat, {
    text: `🔰 *Admin-TK Downloader*

🎵 *Título:* ${videoData.title}
⏳ *Duración:* ${videoData.duration.timestamp}
👁️ *Vistas:* ${videoData.views}
📅 *Publicado:* ${videoData.ago}
🌐 *Enlace:* ${videoData.url}

🕒 *${status}*`,
    edit: initialMessage.key
  });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
}

// Enviar el archivo de audio descargado
async function sendAudioFile(m, conn, videoData, downloadUrl, thumbBuffer) {
  const doc = {
    audio: { url: downloadUrl },
    mimetype: 'audio/mpeg',
    fileName: `${videoData.title}.mp3`,
    jpegThumbnail: thumbBuffer,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        mediaType: 2,
        mediaUrl: videoData.url,
        title: videoData.title,
        sourceUrl: videoData.url,
        thumbnail: thumbBuffer
      }
    }
  };
  await conn.sendMessage(m.chat, doc, { quoted: m });
  await conn.sendMessage(m.chat, { text: '⚠️ *Admin-TK:* El archivo ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.', quoted: m });
}

// Enviar archivo de video descargado
async function sendVideoFile(m, conn, videoData, videoUrl, thumbBuffer) {
  const videoDoc = {
    video: { url: videoUrl },
    mimetype: 'video/mp4',
    fileName: `${videoData.title}.mp4`,
    jpegThumbnail: thumbBuffer,
    caption: `🎥 *${videoData.title}*
📽 *Fuente*: ${videoData.url}`
  };
  await conn.sendMessage(m.chat, videoDoc, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  await conn.sendMessage(m.chat, { text: '⚠️ *Admin-TK:* El video ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.', quoted: m });
}

handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play|playvideo)$/i;

export default handler;
