import axios from 'axios';
import yts from 'yt-search';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await m.react('❌');
    throw m.reply(`⚠️ *Admin-TK:* Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* ${usedPrefix + command} Joji Ew`);
  }

  try {
    await m.react('🔍');
    let results = await yts(text);
    if (!results || results.videos.length === 0) {
      await m.react('❌');
      throw m.reply(`⚠️ *Admin-TK:* No se encontraron resultados para "${text}".`);
    }

    let tes = results.videos[0];
    if (!tes || !tes.url) {
      await m.react('❌');
      throw m.reply(`⚠️ *Admin-TK:* No se pudo obtener la URL del video.`);
    }

    await m.react('⏳');
    const baseUrl = 'https://cuka.rfivecode.com';
    const cukaDownloader = {
      youtube: async (url, exct) => {
        const format = ['mp3', 'mp4'];
        try {
          const response = await fetch(`${baseUrl}/download`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, format: exct }),
          });

          const data = await response.json();
          if (!data || !data.downloadUrl) {
            throw new Error('No se pudo obtener el enlace de descarga.');
          }
          return data;
        } catch (error) {
          console.error('Error:', error);
          return { success: false, message: error.message };
        }
      },
    };

    let dataos = await cukaDownloader.youtube(tes.url, 'mp3');
    if (!dataos || !dataos.downloadUrl) {
      await m.react('❌');
      throw m.reply(`⚠️ *Admin-TK:* Hubo un problema al intentar descargar el audio. ${dataos.message || ''}`);
    }

    let { title, thumbnail, quality, downloadUrl } = dataos;
    if (!title || !thumbnail || !downloadUrl) {
      await m.react('❌');
      throw m.reply(`⚠️ *Admin-TK:* Faltan datos necesarios para enviar el archivo.`);
    }

    await m.react('✅');
    m.reply(`✨ *Admin-TK:* Enviando "${title}" (${quality})

🔗 *Link:* ${tes.url}`);

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
          thumbnail: await (await conn.getFile(thumbnail)).data,
        },
      },
    };

    await conn.sendMessage(m.chat, doc, { quoted: m });
  } catch (e) {
    await m.react('❌');
    console.error(e);
    m.reply(`⚠️ *Admin-TK:* Ocurrió un error inesperado. Por favor, intenta nuevamente.`);
  }
};

handler.help = ['play2 *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play2)$/i;

export default handler;
