import axios from 'axios';
import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw m.reply(`⚠️ *Admin-TK:* Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *${usedPrefix + command} Joji Ew*`);

  let results = await yts(text);
  let tes = results.videos[0];
  if (!tes) throw m.reply('⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.');

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
    return m.reply(dataos.message);
  }

  let { title, thumbnail, quality, downloadUrl } = dataos;

  // Primero enviar el mensaje informativo
  await conn.sendMessage(m.chat, {
    text: `⚠️ *Admin-TK:* Estoy preparando el archivo **${title}** (${quality}). Esto podría tomar unos segundos, gracias por tu paciencia.`
  }, { quoted: m });

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
  if (!text) throw m.reply(`⚠️ *Admin-TK:* Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *${usedPrefix + command} Joji Ew*`);

  let results = await yts(text);
  let tes = results.videos[0];
  if (!tes) throw m.reply('⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.');

  let videoUrl = tes.url;

  await conn.sendMessage(m.chat, {
    text: `⚠️ *Admin-TK:* Estoy preparando el video **${tes.title}**. Esto podría tomar unos segundos, gracias por tu paciencia.`
  }, { quoted: m });

  // Enviar información del video y luego el video descargado
  const videoDoc = {
    video: { url: videoUrl },
    mimetype: 'video/mp4',
    fileName: `${tes.title}.mp4`,
    caption: `🎥 *${tes.title}*
📽 *Fuente*: ${videoUrl}`
  };
  try {
    await conn.sendMessage(m.chat, videoDoc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El video ha sido enviado. Ahora estoy preparando el archivo de audio...');
  } catch (error) {
    console.error('Error al enviar el video:', error);
    return m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el video. Por favor, inténtalo nuevamente.');
  }

  let dataos = await downloadFromApi(0, tes.url, 'mp3');
  if (!dataos.success) {
    return m.reply(dataos.message);
  }

  let { downloadUrl } = dataos;

  const audioDoc = {
    audio: { url: downloadUrl },
    mimetype: 'audio/mp4',
    fileName: `${tes.title}.mp3`
  };
  try {
    await conn.sendMessage(m.chat, audioDoc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El archivo de audio ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.');
  } catch (error) {
    console.error('Error al enviar el audio:', error);
    m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el archivo de audio. Por favor, inténtalo nuevamente.');
  }
};

// Handler para el comando '.play2'
let play2Handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw m.reply(`⚠️ *Admin-TK:* Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *${usedPrefix + command} Joji Ew*`);

  let results = await yts(text);
  let tes = results.videos[0];
  if (!tes) throw m.reply('⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.');

  let videoUrl = tes.url;

  await conn.sendMessage(m.chat, {
    text: `⚠️ *Admin-TK:* Estoy preparando el video y el audio para **${tes.title}**. Esto podría tomar unos segundos, gracias por tu paciencia.`
  }, { quoted: m });

  // Enviar el video descargado primero
  const videoDoc = {
    video: { url: videoUrl },
    mimetype: 'video/mp4',
    fileName: `${tes.title}.mp4`,
    caption: `🎥 *${tes.title}*
📽 *Fuente*: ${videoUrl}`
  };
  try {
    await conn.sendMessage(m.chat, videoDoc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El video ha sido enviado. Ahora estoy preparando el archivo de audio...');
  } catch (error) {
    console.error('Error al enviar el video:', error);
    return m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el video. Por favor, inténtalo nuevamente.');
  }

  let dataos = await downloadFromApi(0, tes.url, 'mp3');
  if (!dataos.success) {
    return m.reply(dataos.message);
  }

  let { downloadUrl } = dataos;

  const audioDoc = {
    audio: { url: downloadUrl },
    mimetype: 'audio/mp4',
    fileName: `${tes.title}.mp3`
  };
  try {
    await conn.sendMessage(m.chat, audioDoc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El archivo de audio ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.');
  } catch (error) {
    console.error('Error al enviar el audio:', error);
    m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el archivo de audio. Por favor, inténtalo nuevamente.');
  }
};

handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play)$/i;

playVideoHandler.help = ['playvideo *<consulta>*'];
playVideoHandler.tags = ['downloader'];
playVideoHandler.command = /^(playvideo)$/i;

play2Handler.help = ['play2 *<consulta>*'];
play2Handler.tags = ['downloader'];
play2Handler.command = /^(play2)$/i;

export default handler;
export { playVideoHandler, play2Handler };
