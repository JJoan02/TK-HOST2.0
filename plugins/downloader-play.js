case 'play': {
  if (!text || text.trim() === "") {
    return reply(
      `🌟 *Admin-TK te pregunta:*\n\n¿Qué música deseas buscar? Escribe el título o enlace después del comando.\n\n📌 Ejemplo: *${prefix + command} Joji - Glimpse of Us*`
    );
  }

  reply(`⏳ *Admin-TK está buscando tu música... ¡un momento por favor!*`);

  try {
    const axios = require("axios");

    // Función para obtener el buffer de la miniatura
    async function getBuffer(url) {
      const res = await axios({
        method: "get",
        url,
        responseType: "arraybuffer",
      });
      return res.data;
    }

    // Solicitud a la API externa
    const apiResponse = await axios.get(
      `https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`
    );
    const video = apiResponse.data.result;

    if (!video) {
      return reply("❌ *Admin-TK informa:* No se encontró el video o audio solicitado.");
    }

    if (video.duration.seconds >= 3600) {
      return reply(
        "❌ *Admin-TK informa:* El video tiene más de 1 hora de duración y no puede descargarse."
      );
    }

    const { audio, video: videoUrl, thumbnail, title, url: videoPageUrl } = video.download;

    if (!audio || !videoUrl) {
      return reply(
        "❌ *Admin-TK informa:* No se pudieron obtener los enlaces de descarga. Intenta nuevamente."
      );
    }

    // Descargar la miniatura
    const thumbBuffer = await getBuffer(thumbnail);

    // Enviar el video
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        jpegThumbnail: thumbBuffer,
        caption: `🎥 *${title}*\n📽 *Fuente:* ${videoPageUrl}\n\n🔰 *Descargado por Admin-TK*`,
      },
      { quoted: m }
    );

    // Enviar el audio
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audio },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        jpegThumbnail: thumbBuffer,
        caption: `🎵 *Título:* ${title}\n\n🔰 *Audio descargado por Admin-TK*`,
      },
      { quoted: m }
    );

    // Confirmar éxito
    reply(`✅ *Admin-TK informa:* ¡Descarga completada con éxito!`);
  } catch (e) {
    console.error(`❌ Error en el comando play: ${e.message}`);
    reply(`❌ *Admin-TK informa:* Ocurrió un error: ${e.message}`);
  }
}
break;
