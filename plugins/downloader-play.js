import yts from 'yt-search';
import axios from 'axios';
import { yta, ytv } from 'api-dylux'; // Herramientas para descargar audio/video

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas buscar? Escribe el título o enlace después del comando.\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`,
        m
      );
    }

    await m.react("⏳");

    // Realizar la búsqueda en YouTube
    const res = await yts(text);
    const video = res.videos[0];

    if (!video) {
      return conn.reply(m.chat, "❌ *No se encontraron resultados para tu búsqueda.*", m);
    }

    const { title, url, thumbnail, timestamp, views, ago } = video;

    // Mostrar información del video
    const infoText = `🔰 *Admin-TK Downloader*\n\n🎥 *Título:* ${title}\n⏳ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views.toLocaleString()}\n📅 *Publicado:* ${ago}\n🌐 *Enlace:* ${url}`;
    await conn.reply(m.chat, infoText, m);

    // Descargar video en baja calidad
    try {
      const videoData = await ytv(url, "360p");
      const { dl_url: videoUrl, size: videoSize } = videoData;

      if (parseFloat(videoSize.split("MB")[0]) > 500) {
        return conn.reply(
          m.chat,
          `❌ *El archivo MP4 es demasiado grande (${videoSize}). Intenta con otro video.*`,
          m
        );
      }

      await conn.sendMessage(
        m.chat,
        { video: { url: videoUrl }, caption: `🎥 *Video descargado con éxito.*\n\n🔰 *Admin-TK*`, fileName: `${title}.mp4` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error al descargar el video:", error.message);
      await conn.reply(m.chat, "❌ *No se pudo descargar el video en baja calidad.*", m);
    }

    // Descargar audio en MP3
    try {
      const audioData = await yta(url, "128kbps");
      const { dl_url: audioUrl, size: audioSize } = audioData;

      if (parseFloat(audioSize.split("MB")[0]) > 100) {
        return conn.reply(
          m.chat,
          `❌ *El archivo MP3 es demasiado grande (${audioSize}). Intenta con otro video.*`,
          m
        );
      }

      await conn.sendMessage(
        m.chat,
        { audio: { url: audioUrl }, mimetype: "audio/mp3", fileName: `${title}.mp3` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error al descargar el audio:", error.message);
      await conn.reply(m.chat, "❌ *No se pudo descargar el audio MP3.*", m);
    }

    await m.react("✅");
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || "Algo salió mal."}`, m);
    await m.react("❌");
  }
};

handler.help = ["play"].map((v) => v + " <título o enlace>");
handler.tags = ["downloader"];
handler.command = ["play"];
handler.register = true;

export default handler;
