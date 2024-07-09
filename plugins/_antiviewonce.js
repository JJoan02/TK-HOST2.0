import { default as downloadContentFromMessage } from 'baileys';

// Función principal antes de manejar el mensaje
export async function before(m, { conn, isAdmin, isBotAdmin }) {
    // Obtener configuración del chat
    const { antiver, isBanned } = global.db.data.chats[m.chat];

    // Verificar si el modo antiver está activado o si el chat está prohibido
    if (!antiver || isBanned || !['viewOnceMessageV2', 'viewOnceMessageV2Extension'].includes(m.mtype)) return;

    // Identificar el tipo de mensaje y obtener el contenido del mensaje
    const msg = m.mtype === 'viewOnceMessageV2' ? m.message.viewOnceMessageV2.message : m.message.viewOnceMessageV2Extension.message;
    const type = Object.keys(msg)[0];
    const mediaType = determineMediaType(type, m.mtype);

    // Descargar contenido del mensaje
    const media = await downloadContentFromMessage(msg[type], mediaType);
    const buffer = await concatenateMediaChunks(media);

    // Formatear tamaño del archivo
    const fileSize = formatFileSize(msg[type].fileLength);

    // Obtener descripción con el formato adecuado
    const description = antiver ? mid.antiviewonce(type, fileSize, m, msg) : '';

    // Enviar el archivo con el mensaje adecuado
    return sendAppropriateMessage(conn, m, buffer, type, description, mediaType);
}

// Función para determinar el tipo de medio
function determineMediaType(type, mtype) {
    if (mtype === 'viewOnceMessageV2') {
        return type === 'imageMessage' ? 'image' : 'video';
    } else if (mtype === 'viewOnceMessageV2Extension') {
        return 'audio';
    }
}

// Función para concatenar chunks de datos al buffer
async function concatenateMediaChunks(media) {
    let buffer = Buffer.concat([]);
    for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

// Función para formatear el tamaño del archivo en una cadena legible
function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'TY', 'EY'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

// Función para enviar el mensaje adecuado dependiendo del tipo de contenido
async function sendAppropriateMessage(conn, m, buffer, type, description, mediaType) {
    if (/image|video/.test(type)) {
        const fileName = type === 'imageMessage' ? 'error.jpg' : 'error.mp4';
        return await conn.sendFile(m.chat, buffer, fileName, description, m, false, { mentions: [m.sender] });
    } else if (/audio/.test(type)) {
        await conn.reply(m.chat, description, m, { mentions: [m.sender] });
        return await conn.sendMessage(m.chat, { audio: buffer, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
    }
}
