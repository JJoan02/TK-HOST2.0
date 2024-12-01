import axios from 'axios';
import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return await handleMissingQuery(m, conn, usedPrefix, command);
  }

  try {
    await sendInitialMessage(m, conn);
    let videoData = await searchVideo(text);
    if (!videoData) {
      return await handleNoResults(m, conn);
    }

    await sendVideoInfo(m, conn, videoData);
    let downloadData = await downloadAudio(videoData.url);
    if (!downloadData.success) {
      return await handleDownloadError(m, conn, downloadData.message);
    }

    await updateDownloadStatus(m, conn, videoData, downloadData);
    await sendAudioFile(m, conn, videoData, downloadData.downloadUrl);
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
async function sendVideoInfo(m, conn, videoData) {
  await conn.sendMessage(m.chat, {
    text: `🔰 *Admin-TK Downloader*

🎵 *Título:* ${videoData.title}
⏳ *Duración:* ${videoData.duration.timestamp}
👁️ *Vistas:* ${videoData.views}
📅 *Publicado:* ${videoData.ago}
🌐 *Enlace:* ${videoData.url}

🕒 *Preparando descarga...*`,
    edit: m.key
  });
}

// Descargar el audio usando múltiples APIs
async function downloadAudio(url) {
  const apiList = [
    {
      baseUrl: 'https://cuka.rfivecode.com',
      endpoints: {
        youtube: '/download',
      }
    },
    {
      baseUrl: 'https://api.yourdownloadapi.com',
      endpoints: {
        youtube: '/youtube/download',
      }
    },
    {
      baseUrl: 'https://anotherdownloadapi.com',
      endpoints: {
        youtube: '/yt',
      }
    }
  ];

  for (let i = 0; i < apiList.length; i++) {
    try {
      const response = await axios.post(`${apiList[i].baseUrl}${apiList[i].endpoints.youtube}`, { url, format: 'mp3' });
      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      console.error(`API ${i + 1} falló:`, error.message);
    }
  }
  return { success: false, message: '⚠️ *Admin-TK:* Todas las APIs fallaron. Por favor, intenta de nuevo más tarde.' };
}

// Editar mensaje indicando que el audio ha sido descargado
async function updateDownloadStatus(m, conn, videoData, downloadData) {
  await conn.sendMessage(m.chat, {
    text: `🔰 *Admin-TK Downloader*

🎵 *Título:* ${videoData.title}
⏳ *Duración:* ${videoData.duration.timestamp}
👁️ *Vistas:* ${videoData.views}
📅 *Publicado:* ${videoData.ago}
🌐 *Enlace:* ${videoData.url}

🕒 *Audio descargado...*`,
    edit: m.key
  });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
}

// Enviar el archivo de audio descargado
async function sendAudioFile(m, conn, videoData, downloadUrl) {
  const doc = {
    audio: { url: downloadUrl },
    mimetype: 'audio/mp4',
    fileName: `${videoData.title}.mp3`,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        mediaType: 2,
        mediaUrl: videoData.url,
        title: videoData.title,
        sourceUrl: videoData.url,
        thumbnail: await (await conn.getFile(videoData.thumbnail)).data
      }
    }
  };
  await conn.sendMessage(m.chat, doc, { quoted: m });
  await conn.sendMessage(m.chat, { text: '⚠️ *Admin-TK:* El archivo ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.', quoted: m });
}

// Handler para el comando '.playvideo'
let playVideoHandler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return await handleMissingQuery(m, conn, usedPrefix, command);
  }

  try {
    await sendInitialMessage(m, conn);
    let videoData = await searchVideo(text);
    if (!videoData) {
      return await handleNoResults(m, conn);
    }

    await sendVideoInfo(m, conn, videoData);
    await sendVideoFile(m, conn, videoData);
  } catch (error) {
    console.error('Error en el proceso:', error);
    await handleUnexpectedError(m, conn);
  }
};

// Enviar archivo de video descargado
async function sendVideoFile(m, conn, videoData) {
  const videoDoc = {
    video: { url: videoData.url },
    mimetype: 'video/mp4',
    fileName: `${videoData.title}.mp4`,
    caption: `🎥 *${videoData.title}*
📽 *Fuente*: ${videoData.url}`
  };
  await conn.sendMessage(m.chat, videoDoc, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  await conn.sendMessage(m.chat, { text: '⚠️ *Admin-TK:* El video ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.', quoted: m });
}

handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play)$/i;

playVideoHandler.help = ['playvideo *<consulta>*'];
playVideoHandler.tags = ['downloader'];
playVideoHandler.command = /^(playvideo)$/i;

export default handler;
export { playVideoHandler };
