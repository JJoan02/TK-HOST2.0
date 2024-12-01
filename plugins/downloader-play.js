import yts from 'yt-search';
import axios from 'axios';

const BASE_URL = 'https://youtube-download-api.matheusishiyama.repl.co';

let searchResults = []; // Resultados temporales por chat

const buscarPlay = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) {
      return await conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué música deseas buscar? Escribe el título o enlace después del comando.\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`,
        m
      );
    }

    const results = await yts(text);
    const videos = results.videos;

    if (!videos.length) {
      return await conn.reply(m.chat, '❌ No se encontraron resultados. Intenta con otro título.', m);
    }

    // Almacena resultados temporalmente
    searchResults[m.chat] = videos;

    let message = `🔍 *Resultados de búsqueda:*\n\n`;
    videos.slice(0, 5).forEach((video, index) => {
      message += `*${index + 1}.* 🎵 *${video.title}*\n`;
      message += `⏳ Duración: ${video.timestamp}\n👁️ Vistas: ${video.views}\n🌐 Enlace: ${video.url}\n\n`;
    });

    message += `📝 *Responde con el número del video para descargar (MP3 o MP4).*`;

    await conn.reply(m.chat, message, m);
  } catch (error) {
    console.error('Error en buscarPlay:', error.message || error);
    await conn.reply(m.chat, `❌ *Error al buscar:* ${error.message || 'Ocurrió un problema'}`, m);
  }
};

const descargarPlay = async (m, { conn, text, command }) => {
  try {
    const chatResults = searchResults[m.chat];
    if (!chatResults || !chatResults.length) {
      return await conn.reply(m.chat, '❌ No hay resultados disponibles. Usa el comando `.play` primero.', m);
    }

    const index = parseInt(text) - 1;
    if (isNaN(index) || index < 0 || index >= chatResults.length) {
      return await conn.reply(m.chat, '❌ Número inválido. Elige un número válido de la lista.', m);
    }

    const video = chatResults[index];
    const isAudio = command === 'play';
    const downloadUrl = isAudio
      ? `${BASE_URL}/mp3/?url=${encodeURIComponent(video.url)}`
      : `${BASE_URL}/mp4/?url=${encodeURIComponent(video.url)}`;
    const fileType = isAudio ? 'audio' : 'video';
    const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4';
    const extension = isAudio ? 'mp3' : 'mp4';

    await conn.reply(m.chat, `⏳ Descargando *${video.title}* en formato ${isAudio ? 'MP3' : 'MP4'}...`, m);

    await conn.sendMessage(m.chat, {
      [fileType]: { url: downloadUrl },
      mimetype,
      fileName: `${video.title}.${extension}`,
      caption: `🎶 *Título:* ${video.title}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
    });

    await conn.reply(m.chat, `✅ *¡Descarga completada!*\n\n🔰 *Admin-TK siempre a tu servicio.*`, m);
  } catch (error) {
    console.error('Error en descargarPlay:', error.message || error);
    await conn.reply(m.chat, `❌ *Error al descargar:* ${error.message || 'Ocurrió un problema'}`, m);
  }
};

handler = {
  buscar: {
    command: ['play', 'playvideo'], // Comandos para buscar
    handler: buscarPlay,
    tags: ['downloader'],
    help: ['play <consulta>', 'playvideo <consulta>'],
  },
  descargar: {
    command: ['descargarplay'], // Comando para descargar
    handler: descargarPlay,
    tags: ['downloader'],
    help: ['descargarplay <número>'],
  },
};

export default handler;
