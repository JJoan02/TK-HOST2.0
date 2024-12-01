import axios from 'axios';
import yts from 'yt-search';

let activeDownloads = {}; // Para controlar solicitudes activas por usuario
let downloadQueue = []; // Cola de descargas pendientes

// Handler principal para los comandos
let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return await handleMissingQuery(m, conn, command);
  }

  const userId = m.sender;

  // Verificar si ya hay una solicitud activa del mismo usuario
  if (activeDownloads[userId]) {
    return await notifyUserActiveRequest(m, conn);
  }

  // Si hay descargas en proceso, agregar a la cola
  if (Object.keys(activeDownloads).length > 0) {
    downloadQueue.push({ userId, conn, text, m, command });
    return await notifyUserAddedToQueue(m, conn);
  }

  // Iniciar proceso de descarga
  await processDownloadRequest({ userId, conn, text, m, command });
};

// Proceso principal de descarga
async function processDownloadRequest({ userId, conn, text, m, command }) {
  activeDownloads[userId] = true; // Marcar al usuario como activo

  try {
    const initialMessage = await sendInitialMessage(m, conn);
    const videoData = await searchVideo(text);

    if (!videoData || videoData.duration.seconds === 0) {
      delete activeDownloads[userId];
      return await handleNoResultsOrInvalidVideo(m, conn);
    }

    await updateVideoInfo(m, conn, initialMessage, videoData);

    const { videoUrl, audioUrl, thumbBuffer } = await downloadMediaWithQualityControl(videoData.url, text);
    if (!videoUrl) {
      delete activeDownloads[userId];
      return await handleDownloadError(m, conn, 'No se pudo obtener la URL del video. Por favor inténtalo de nuevo.');
    }

    // Descargar y enviar el video
    await updateDownloadStatus(m, conn, initialMessage, videoData, 'Descargando video...');
    await sendVideoFile(m, conn, videoData, videoUrl, thumbBuffer);
    await updateDownloadStatus(m, conn, initialMessage, videoData, 'Video descargado con éxito...');

    if (!audioUrl) {
      delete activeDownloads[userId];
      return await handleDownloadError(m, conn, 'No se pudo obtener la URL del audio. Por favor inténtalo de nuevo.');
    }

    // Descargar y enviar el audio
    await updateDownloadStatus(m, conn, initialMessage, videoData, 'Descargando audio...');
    await sendAudioFile(m, conn, videoData, audioUrl, thumbBuffer);
    await updateDownloadStatus(m, conn, initialMessage, videoData, 'Audio descargado con éxito...');
  } catch (error) {
    console.error('Error en el proceso:', error);
    await handleUnexpectedError(m, conn);
  } finally {
    delete activeDownloads[userId]; // Liberar al usuario
    processNextInQueue(); // Procesar la siguiente solicitud en la cola
  }
}

// Procesar la siguiente solicitud en la cola
function processNextInQueue() {
  if (downloadQueue.length > 0) {
    const nextRequest = downloadQueue.shift(); // Obtener la siguiente solicitud
    processDownloadRequest(nextRequest);
  }
}

// Notificar al usuario que tiene una solicitud activa
async function notifyUserActiveRequest(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '⚠️ Ya tienes una solicitud en proceso. Por favor espera a que termine antes de enviar otra.',
  }, { quoted: m });
}

// Notificar al usuario que fue añadido a la cola
async function notifyUserAddedToQueue(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '📥 Tu solicitud ha sido añadida a la cola de descargas. Se procesará en cuanto sea posible.',
  }, { quoted: m });
}

// Notificar cuando falta el texto de búsqueda
async function handleMissingQuery(m, conn, command) {
  await conn.sendMessage(m.chat, {
    text: `⚠️ Necesitas proporcionar una consulta de búsqueda.\n\nEjemplo: *.${command} Despacito*`,
  }, { quoted: m });
}

// Manejar cuando no hay resultados o el video es inválido
async function handleNoResultsOrInvalidVideo(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '⚠️ No se encontraron resultados o el video es inválido. Por favor intenta con otra consulta.',
  }, { quoted: m });
}

// Manejar errores de descarga
async function handleDownloadError(m, conn, message) {
  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Manejar errores inesperados
async function handleUnexpectedError(m, conn) {
  await conn.sendMessage(m.chat, {
    text: '⚠️ Ha ocurrido un error inesperado. Por favor intenta nuevamente más tarde.',
  }, { quoted: m });
}

// Enviar mensaje inicial
async function sendInitialMessage(m, conn) {
  let initialMessage = await conn.sendMessage(m.chat, { text: '✧ Espere un momento...' }, { quoted: m });
  return initialMessage;
}

// Buscar video en YouTube
async function searchVideo(query) {
  let results = await yts(query);
  return results.videos[0];
}

// Actualizar información del video
async function updateVideoInfo(m, conn, initialMessage, videoData) {
  await conn.sendMessage(m.chat, {
    text: `🔰 *Descarga en proceso...*\n\n🎵 *Título:* ${videoData.title}\n⏳ *Duración:* ${videoData.duration.timestamp}\n👁️ *Vistas:* ${videoData.views}\n📅 *Publicado:* ${videoData.ago}\n🌐 *Enlace:* ${videoData.url}\n\n🕒 *Preparando descarga...*`,
    edit: initialMessage.key,
  });
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

// Obtener imagen en buffer
async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return res.data;
}

// Actualizar estado de la descarga
async function updateDownloadStatus(m, conn, initialMessage, videoData, status) {
  await conn.sendMessage(m.chat, {
    text: `🔰 *Descarga en proceso...*\n\n🎵 *Título:* ${videoData.title}\n⏳ *Duración:* ${videoData.duration.timestamp}\n👁️ *Vistas:* ${videoData.views}\n📅 *Publicado:* ${videoData.ago}\n🌐 *Enlace:* ${videoData.url}\n\n🕒 *${status}*`,
    edit: initialMessage.key,
  });
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
