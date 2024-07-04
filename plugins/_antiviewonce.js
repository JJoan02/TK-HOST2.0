import { default as downloadContentFromMessage } from 'global.baileys';

const handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  let media, msg, type;
  const { antiver, isBanned } = global.db.data.chats[m.chat];

  // Verifica si la función de anti-view-once está habilitada y el chat no está prohibido
  if (!antiver || isBanned || !(m.mtype === 'viewOnceMessageV2' || m.mtype === 'viewOnceMessageV2Extension')) return;

  if (m.mtype === 'viewOnceMessageV2' || m.mtype === 'viewOnceMessageV2Extension') {
    msg = m.mtype === 'viewOnceMessageV2' ? m.message.viewOnceMessageV2.message : m.message.viewOnceMessageV2Extension.message;
    type = Object.keys(msg)[0];

    // Descarga el contenido del mensaje dependiendo del tipo
    if (m.mtype === 'viewOnceMessageV2') {
      media = await downloadContentFromMessage(msg[type], type === 'imageMessage' ? 'image' : type === 'videoMessage' ? 'video' : 'audio');
    } else {
      media = await downloadContentFromMessage(msg[type], 'audio');
    }

    let buffer = Buffer.from([]);
    for await (const chunk of media) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Formatea el tamaño del archivo
    const fileSize = formatFileSize(msg[type].fileLength);
    const description = mid.antiviewonce(type, fileSize, m, msg);

    // Envía el archivo dependiendo del tipo
    if (/image|video/.test(type)) {
      return await conn.sendFile(m.chat, buffer, type === 'imageMessage' ? 'error.jpg' : 'error.mp4', description, m, false, { mentions: [m.sender] });
    }

    if (/audio/.test(type)) {
      await conn.reply(m.chat, description, m, { mentions: [m.sender] });
      await conn.sendMessage(m.chat, { audio: buffer, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
    }
  }
};

export default handler;

function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'TY', 'EY'];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
}
