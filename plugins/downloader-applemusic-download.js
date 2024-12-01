import axios from 'axios';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `❌ Uso correcto: ${usedPrefix + command} <link de Apple Music>. ¡Descarga estilo Admin-TK!`;

  const downloadAppleMusicTK = async (url) => {
    try {
      const apiUrl = `https://aaplmusicdownloader.com/api/applesearch.php?url=${url}`;
      const { data } = await axios.get(apiUrl);
      return data;
    } catch (error) {
      console.error("⚠️ Error TK:", error.message);
      return null;
    }
  };

  await conn.sendMessage(m.chat, { react: { text: "⏬", key: m.key } });

  const trackData = await downloadAppleMusicTK(text);

  if (!trackData) throw '⚠️ Admin-TK no pudo descargar la canción. Inténtalo de nuevo.';

  const doc = {
    audio: { url: trackData.dlink },
    mimetype: 'audio/mp4',
    fileName: `TK-${trackData.name}.mp3`,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        mediaType: 2,
        mediaUrl: text,
        title: `🎵 ${trackData.name}`,
        sourceUrl: text,
        thumbnail: await (await conn.getFile(trackData.thumb)).data,
      },
    },
  };

  await conn.sendMessage(m.chat, doc, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
};

handler.help = ['applemusic <link>'];
handler.tags = ['downloader'];
handler.command = /^(applemusic)$/i;

export default handler;
