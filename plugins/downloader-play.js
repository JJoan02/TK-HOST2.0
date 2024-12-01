import yts from 'yt-search';
import axios from 'axios';
import fs from 'fs';
import os from 'os';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return await conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué música deseas buscar? Escribe el título o enlace después del comando:\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`,
        m
      );
    }

    // Búsqueda en YouTube
    const results = await yts(text);
    const video = results.videos[0];
    if (!video) throw 'No se encontró el contenido solicitado. Intenta con otro título.';

    const { title, thumbnail, timestamp, views, ago, url } = video;

    // Enviar información inicial
    await conn.reply(
      m.chat,
      `🔰 *Admin-TK Downloader*\n\n🎵 *Título:* ${title}\n⏳ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views}\n📅 *Publicado:* ${ago}\n🌐 *Enlace:* ${url}\n\n🕒 *Preparando descarga...*`,
      m
    );

    // Descarga de música MP3 utilizando la API de cuka
    const baseUrl = 'https://cuka.rfivecode.com';
    const response = await axios.post(
      `${baseUrl}/download`,
      { url, format: 'mp3' },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.data.success) throw `Error: ${response.data.message}`;

    const { downloadUrl } = response.data;

    // Enviar archivo MP3
    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `🎶 *Título:* ${title}\n📅 *Publicado:* ${ago}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: url,
          title: title,
          sourceUrl: url,
          thumbnail: await (await conn.getFile(thumbnail)).data,
        },
      },
    });

    await conn.reply(m.chat, `✅ *¡Descarga completada!*\n\n🔰 *Admin-TK siempre a tu servicio.*`, m);
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || error}\n\n🔰 *Por favor, intenta nuevamente.*`, m);
  }
};

// Configuración del Handler
handler.command = ['play']; // Comando para descargar música MP3
handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
