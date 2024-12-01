case 'play': {
  if (!text || text.trim() === "") {
    return reply(`🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas buscar? Escribe el título después del comando.\n\n📌 Ejemplo: ${prefix + command} Joji - Glimpse of Us`);
  }
  reply(mess.wait);

  try {
    const axios = require("axios");

    async function getBuffer(url) {
      const res = await axios({
        method: 'get',
        url,
        responseType: 'arraybuffer',
      });
      return res.data;
    }

    // Realizar solicitud a la API externa
    const apiResponse = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`);
    const video = apiResponse.data.result;

    if (!video) return reply('❌ Video o audio no encontrado.');
    if (video.duration.seconds >= 3600) {
      return reply('❌ El video tiene más de 1 hora de duración y no puede descargarse.');
    }

    const { audio, video: videoUrl, thumbnail, title, url: videoPageUrl } = video.download;
    if (!audio || !videoUrl) {
      return reply('❌ No se pudieron obtener los enlaces de descarga. Intenta de nuevo.');
    }

    const thumbBuffer = await getBuffer(thumbnail);

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      jpegThumbnail: thumbBuffer,
      caption: `🎥 *${title}*\n📽 *Fuente:* ${videoPageUrl}`,
    }, { quoted: m });

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: audio },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      jpegThumbnail: thumbBuffer,
    }, { quoted: m });

    reply('✅ *Descarga completada!*\n\n🔰 *Admin-TK siempre a tu servicio.*');
  } catch (e) {
    console.error(`❌ Error en el comando play: ${e.message}`);
    reply(`❌ *Error:* ${e.message}`);
  }
}
break;
