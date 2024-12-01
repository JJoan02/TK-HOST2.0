import axios from 'axios';
import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ *Admin-TK:*
Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *.play Rosa pastel Belanova*`
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  // Enviar mensaje inicial indicando que se está procesando
  let initialMessage = await conn.sendMessage(m.chat, {
    text: '✧ Espere un momento...'
  }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let results = await yts(text);
  let tes = results.videos[0];
  if (!tes) {
    await conn.sendMessage(m.chat, {
      text: '⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.'
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return;
  }

  // Editar el mensaje inicial con la información detallada del video
  await conn.sendMessage(m.chat, {
    text: `🔰 *Admin-TK Downloader*

🎵 *Título:* ${tes.title}
⏳ *Duración:* ${tes.duration.timestamp}
👁️ *Vistas:* ${tes.views}
📅 *Publicado:* ${tes.ago}
🌐 *Enlace:* ${tes.url}

🕒 *Preparando descarga...*`,
    edit: initialMessage.key
  });

  // Múltiples APIs para descarga, por si una falla.
  const apiList = [
    {
      baseUrl: 'https://cuka.rfivecode.com',
      endpoints: {
        youtube: '/download',
        tiktok: '/tiktok/download',
        spotify: '/spotify/download'
      }
    },
    {
      baseUrl: 'https://api.yourdownloadapi.com',
      endpoints: {
        youtube: '/youtube/download',
        tiktok: '/tiktok/download',
        spotify: '/spotify/download'
      }
    },
    {
      baseUrl: 'https://anotherdownloadapi.com',
      endpoints: {
        youtube: '/yt',
        tiktok: '/tk',
        spotify: '/sp'
      }
    }
  ];

  const downloadFromApi = async (apiIndex, url, format) => {
    if (apiIndex >= apiList.length) {
      return { success: false, message: '⚠️ *Admin-TK:* Lo siento, todas las APIs fallaron. Por favor, intenta de nuevo más tarde.' };
    }
    const api = apiList[apiIndex];
    try {
      const response = await axios.post(`${api.baseUrl}${api.endpoints.youtube}`, { url, format });
      return response.data;
    } catch (error) {
      console.error(`API ${apiIndex + 1} falló:`, error.message);
      return await downloadFromApi(apiIndex + 1, url, format); // Reintentar con la siguiente API
    }
  };

  let dataos = await downloadFromApi(0, tes.url, 'mp3');
  if (!dataos.success) {
    await conn.sendMessage(m.chat, {
      text: dataos.message
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return;
  }

  let { title, thumbnail, quality, downloadUrl, views, ago, duration } = tes;

  // Editar el mensaje con el estado de descarga completada
  await conn.sendMessage(m.chat, {
    text: `🔰 *Admin-TK Downloader*

🎵 *Título:* ${title}
⏳ *Duración:* ${duration.timestamp}
👁️ *Vistas:* ${views}
📅 *Publicado:* ${ago}
🌐 *Enlace:* ${tes.url}

🕒 *Audio descargado...*`,
    edit: initialMessage.key
  });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  // Luego enviar el archivo de audio
  const doc = {
    audio: { url: downloadUrl },
    mimetype: 'audio/mp4',
    fileName: `${title}.mp3`,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        mediaType: 2,
        mediaUrl: tes.url,
        title: title,
        sourceUrl: tes.url,
        thumbnail: await (await conn.getFile(thumbnail)).data
      }
    }
  };
  try {
    await conn.sendMessage(m.chat, doc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El archivo ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.');
  } catch (error) {
    console.error('Error al enviar el audio:', error);
    m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el archivo. Por favor, inténtalo nuevamente.');
  }
};

// Handler para el comando '.playvideo'
let playVideoHandler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ *Admin-TK:*
Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *.playvideo Rosa pastel Belanova*`
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  // Enviar mensaje inicial indicando que se está procesando
  let initialMessage = await conn.sendMessage(m.chat, {
    text: '✧ Espere un momento...'
  }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let results = await yts(text);
  let tes = results.videos[0];
  if (!tes) {
    await conn.sendMessage(m.chat, {
      text: '⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.'
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return;
  }

  // Editar el mensaje inicial con la información detallada del video
  await conn.sendMessage(m.chat, {
    text: `🔰 *Admin-TK Downloader*

🎵 *Título:* ${tes.title}
⏳ *Duración:* ${tes.duration.timestamp}
👁️ *Vistas:* ${tes.views}
📅 *Publicado:* ${tes.ago}
🌐 *Enlace:* ${tes.url}

🕒 *Preparando descarga del video...*`,
    edit: initialMessage.key
  });

  // Luego enviar el archivo de video
  const videoDoc = {
    video: { url: tes.url },
    mimetype: 'video/mp4',
    fileName: `${tes.title}.mp4`,
    caption: `🎥 *${tes.title}*
📽 *Fuente*: ${tes.url}`
  };
  try {
    await conn.sendMessage(m.chat, videoDoc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El video ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.');
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error al enviar el video:', error);
    m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el archivo de video. Por favor, inténtalo nuevamente.');
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play)$/i;

playVideoHandler.help = ['playvideo *<consulta>*'];
playVideoHandler.tags = ['downloader'];
playVideoHandler.command = /^(playvideo)$/i;

export default handler;
export { playVideoHandler };
