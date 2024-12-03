import axios from 'axios';
import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `🔰 Admin-TK: Por favor, envía el enlace del video de YouTube junto al comando.\n\n✦ Ejemplo:\n> ${usedPrefix + command} https://youtube.com/watch?v=kGobHQ7z8X4`
    );
  }

  try {
    let results = await yts(text);
    let videoInfo = results.all[0];

    if (!videoInfo) {
      return m.reply('🔰 Admin-TK: No se encontró ningún video con esa búsqueda. Asegúrate de que el enlace o título sea válido.');
    }

    await conn.sendMessage(m.chat, { text: '🔰 Admin-TK: Descargando video desde YouTube... 🔽' });
    let response = await fetch(`https://api.zenkey.my.id/api/download/ytmp4?url=${videoInfo.url}&apikey=zenkey`);
    let result = await response.json();

    if (!result.result || !result.result.content || !result.result.content[0]) {
      throw new Error('No se pudo procesar el enlace. Inténtalo más tarde.');
    }

    let { title, mediaLink } = result.result.content[0];
    await conn.sendMessage(
      m.chat,
      {
        document: { url: mediaLink },
        caption: `🔰 Admin-TK: Video descargado con éxito.\n\n🎥 Título: ${title}`,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
      },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`🔰 Admin-TK: Ocurrió un error al procesar tu solicitud.\n\n✦ Detalle del error: ${error.message || 'Error desconocido.'}`);
  }
};

handler.help = ['ytmp4 *<link>*', 'ytvdoc *<link>*'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|ytvdoc)$/i;

export default handler;

