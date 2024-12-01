import axios from 'axios';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Ejemplo de uso: ${usedPrefix + command} <link de Apple Music>`;

  const downloadAppleMusic = async (url) => {
    try {
      const apiUrl = `https://aaplmusicdownloader.com/api/applesearch.php?url=${url}`;
      const { data } = await axios.get(apiUrl);
      return data;
    } catch (error) {
      console.error("Error:", error.message);
      return null;
    }
  };

  const trackData = await downloadAppleMusic(text);

  if (!trackData) throw 'No se pudo descargar la canción.';

  const doc = {
    audio: { url: trackData.dlink },
    mimetype: 'audio/mp4',
    fileName: `${trackData.name}.mp3`,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        mediaType: 2,
        mediaUrl: text,
        title: trackData.name,
        sourceUrl: text,
        thumbnail: await (await conn.getFile(trackData.thumb)).data,
      },
    },
  };

  await conn.sendMessage(m.chat, doc, { quoted: m });
};

handler.help = ['applemusic <link>'];
handler.tags = ['downloader'];
handler.command = /^(applemusic)$/i;

export default handler;
