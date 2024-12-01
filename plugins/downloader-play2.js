import axios from 'axios';
import yts from 'yt-search';
import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';

// Handler para el comando '.play2' y '.playvideo'
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
    const { videoUrl, audioUrl } = await downloadMediaWithQualityControl(videoData.url, text);
    if (!videoUrl) {
      return await handleDownloadError(m, conn, 'No se pudo obtener la URL del video. Por favor inténtalo de nuevo.');
    }

    // Enviar el video primero
    await sendVideoFile(m, conn, videoData, videoUrl);

    if (!audioUrl) {
      return await handleDownloadError(m, conn, 'No se pudo obtener la URL del audio. Por favor inténtalo de nuevo.');
    }

    // Enviar el audio después
    await sendAudioFile(m, conn, videoData, audioUrl);
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
}

async function handleNoResults(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.'
  }, { quoted: m });
}

async function handleDownloadError(m, conn, message) {
  await conn.sendMessage(m.chat, {
    text: message
  }, { quoted: m });
}

async function handleUnexpectedError(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '⚠️ *Admin-TK:* Ha ocurrido un error inesperado. Por favor intenta nuevamente más tarde.'
  }, { quoted: m });
}

// Enviar mensaje inicial indicando que se está procesando
async function sendInitialMessage(m, conn) {
  let initialMessage = await conn.sendMessage(m.chat, {
    text: '✧ Espere un momento...'
  }, { quoted: m });
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

// Descargar audio/video usando la API con control de calidad
async function downloadMediaWithQualityControl(url, text) {
  const qualities = ['1080p', '720p', '480p', '360p', '240p', '144p'];
  for (let quality of qualities) {
    try {
      const res = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}&quality=${quality}`);
      const video = res.data.result;
      if (!video) throw new Error('Video/Audio no encontrado');
      if (video.duration.seconds >= 3600 || video.filesize >= 200 * 1024 * 1024) throw new Error('El video es demasiado largo o demasiado grande!');

      const audioUrl = video.download.audio;
      const videoUrl = video.download.video;
      if (!audioUrl || !videoUrl) throw new Error('No se pudo obtener la URL de audio/vídeo. Por favor inténtalo de nuevo.');

      return { audioUrl, videoUrl };
    } catch (error) {
      console.error(`Error al intentar descargar en calidad ${quality}:`, error.message);
    }
  }
  throw new Error('No se pudo descargar el video con ninguna de las calidades disponibles.');
}

// Enviar el archivo de audio descargado
async function sendAudioFile(m, conn, videoData, downloadUrl) {
  const doc = {
    audio: { url: downloadUrl },
    mimetype: 'audio/mpeg',
    fileName: `${videoData.title}.mp3`,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        mediaType: 2,
        mediaUrl: videoData.url,
        title: videoData.title,
        sourceUrl: videoData.url
      }
    }
  };
  await conn.sendMessage(m.chat, doc, { quoted: m });
}

// Enviar archivo de video descargado
async function sendVideoFile(m, conn, videoData, videoUrl) {
  const videoDoc = {
    video: { url: videoUrl },
    mimetype: 'video/mp4',
    fileName: `${videoData.title}.mp4`,
    caption: `🎥 *${videoData.title}*
📽 *Fuente*: ${videoData.url}`
  };
  await conn.sendMessage(m.chat, videoDoc, { quoted: m });
}

handler.help = ['play2 *<consulta>*', 'playvideo *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play2|playvideo)$/i;

export default handler;
