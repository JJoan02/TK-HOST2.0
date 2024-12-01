import axios from 'axios';
import yts from 'yt-search';

// Handler para el comando '.play'
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Necesitas proporcionar una consulta de búsqueda.\n\nEjemplo: *${usedPrefix}${command} Rosa pastel*`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  try {
    // Mensaje inicial para el proceso
    let statusMessage = await conn.sendMessage(m.chat, { text: '🔎 Buscando música...' }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // Buscar música en YouTube
    let videoData = await searchVideo(text);
    if (!videoData) {
      await conn.sendMessage(m.chat, {
        text: '⚠️ No se encontraron resultados. Intenta con una búsqueda más específica.',
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return;
    }

    // Actualizar mensaje con detalles del audio
    await updateStatusMessage(conn, statusMessage, videoData, '🎵 Música encontrada. Preparando descarga...');

    // Descargar audio
    const { audioUrl } = await downloadMedia(videoData.url, text);
    if (!audioUrl) {
      await conn.sendMessage(m.chat, {
        text: '⚠️ No se pudo descargar el audio. Por favor inténtalo de nuevo.',
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return;
    }

    // Descargar y enviar audio
    await updateStatusMessage(conn, statusMessage, videoData, '⬇️ Descargando audio...');
    await sendAudioFile(conn, m, videoData, audioUrl);

    // Finalizar proceso
    await updateStatusMessage(conn, statusMessage, videoData, '✅ Música descargada con éxito.');
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, {
      text: '⚠️ Ocurrió un error inesperado. Intenta de nuevo más tarde.',
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

// Buscar video en YouTube
async function searchVideo(query) {
  let results = await yts(query);
  return results.videos.length ? results.videos[0] : null;
}

// Actualizar estado del mensaje
async function updateStatusMessage(conn, message, videoData, status) {
  await conn.sendMessage(message.key.remoteJid, {
    text: `🔰 *Admin-TK Music Downloader*\n\n🎵 *Título:* ${videoData.title}\n⏳ *Duración:* ${videoData.duration.timestamp}\n👁️ *Vistas:* ${videoData.views}\n📅 *Publicado:* ${videoData.ago}\n🌐 *Enlace:* ${videoData.url}\n\n🕒 *${status}*`,
    edit: message.key,
  });
}

// Descargar audio usando la API
async function downloadMedia(url, text) {
  try {
    const response = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`);
    const result = response.data.result;
    if (!result) throw new Error('No media found.');
    if (result.duration.seconds > 3600) throw new Error('El audio es demasiado largo.');
    return {
      audioUrl: result.download.audio,
    };
  } catch (error) {
    console.error('Error al descargar audio:', error.message);
    throw error;
  }
}

// Enviar el archivo de audio descargado
async function sendAudioFile(conn, m, videoData, audioUrl) {
  await conn.sendMessage(m.chat, {
    audio: { url: audioUrl },
    mimetype: 'audio/mpeg',
    fileName: `${videoData.title}.mp3`,
  }, { quoted: m });
}

handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play)$/i;

export default handler;
