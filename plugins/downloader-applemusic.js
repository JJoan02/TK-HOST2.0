import axios from 'axios';
import fs from 'fs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.startsWith('http')) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Necesitas proporcionar un enlace de vista previa válido.\n\n*Ejemplo:* ${usedPrefix + command} https://audio-preview-url`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  try {
    let statusMessage = await conn.sendMessage(m.chat, { text: '⬇️ Descargando vista previa...' }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const previewFileName = `VistaPrevia-${Date.now()}.m4a`;
    const response = await axios.get(text, { responseType: 'arraybuffer' });
    fs.writeFileSync(previewFileName, response.data);

    await conn.sendMessage(m.chat, {
      audio: { url: `./${previewFileName}` },
      mimetype: 'audio/mp4',
      fileName: previewFileName,
      contextInfo: {
        externalAdReply: {
          mediaType: 2,
          title: "Vista Previa Descargada",
          sourceUrl: text,
        },
      },
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error.message);
    await conn.sendMessage(m.chat, {
      text: '⚠️ No se pudo descargar la vista previa. Por favor inténtalo nuevamente.',
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['adownload *<url_preview>*'];
handler.tags = ['downloader'];
handler.command = /^(applemusicdownload|adownload)$/i;

export default handler;
