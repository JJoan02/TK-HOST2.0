import { toAudio } from '../lib/converter.js';

// Manejador para convertir archivos de video o audio a audio MP3
let handler = async (m, { conn, usedPrefix, command }) => {
    // Obtener el mensaje citado o el mensaje original
    let q = m.quoted ? m.quoted : m;
    // Obtener el tipo MIME del mensaje
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || '';
    
    // Verificar que el MIME sea de tipo video o audio
    if (!/video|audio/.test(mime)) throw `${lenguajeGB['smsAvisoMG']()}${mid.smsconvert4}`;
    
    // Actualizar la presencia del bot a 'grabando'
    await conn.sendPresenceUpdate('recording', m.chat);
    
    // Descargar el contenido multimedia
    let media = await q.download?.();
    
    // Verificar que se haya descargado el contenido multimedia
    if (!media && !/video/.test(mime)) throw `${lenguajeGB['smsAvisoFG']()}${mid.smsconvert5}`;
    if (!media && !/audio/.test(mime)) throw `${lenguajeGB['smsAvisoFG']()}${mid.smsconvert5}`;
    
    // Convertir el contenido multimedia a formato de audio MP4
    let audio = await toAudio(media, 'mp4');
    
    // Verificar que la conversión fue exitosa
    if (!audio.data && !/audio/.test(mime)) throw `${lenguajeGB['smsAvisoFG']()}${mid.smsconvert6}`;
    if (!audio.data && !/video/.test(mime)) throw `${lenguajeGB['smsAvisoFG']()}${mid.smsconvert6}`;
    
    // Enviar el archivo de audio convertido
    conn.sendFile(m.chat, audio.data, 'error.mp3', '', m, null, { mimetype: 'audio/mp4' });
};

// Configuración del comando y etiquetas
handler.help = ['tomp3 (reply)'];
handler.tags = ['audio'];
handler.command = ['tomp3', 'toaudio', 'mp3'];

export default handler;
