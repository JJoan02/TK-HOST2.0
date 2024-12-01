import axios from 'axios';
import yts from 'yt-search';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw m.reply(`⚠️ *Admin-TK:* Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *${usedPrefix + command} Joji Ew*`);

  let results = await yts(text);
  let tes = results.videos[0];
  if (!tes) throw m.reply('⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Intenta ser más específico.');

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
      return { success: false, message: '⚠️ *Admin-TK:* Todas las APIs fallaron. Intenta de nuevo más tarde.' };
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
  m.reply(`⚠️ *Admin-TK:* Preparando **${title}** (${quality}). Esto podría tomar unos segundos...`);

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
    m.reply('⚠️ *Admin-TK:* El archivo ha sido enviado. Si necesitas algo más, realiza otra solicitud.');
  } catch (error) {
    console.error('Error al enviar el audio:', error);
    m.reply('⚠️ *Admin-TK:* Ocurrió un error mientras se intentaba enviar el archivo. Intenta nuevamente.');
  }
};

handler.help = ['play2 *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play2)$/i;

export default handler;
