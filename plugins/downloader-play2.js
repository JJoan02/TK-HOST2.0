import axios from "axios";
import yts from "yt-search";

let activeDownloads = {}; // Para controlar solicitudes activas por usuario
let downloadQueue = []; // Cola de descargas pendientes

// Handler principal
let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text || text.trim() === "") {
    return m.reply(`Ejemplo: ${usedPrefix + command} Belanova Rosa Pastel`);
  }

  const userId = m.sender;

  // Verificar si ya hay una solicitud activa del mismo usuario
  if (activeDownloads[userId]) {
    return notifyUserActiveRequest(m, conn);
  }

  // Si hay descargas en proceso, agregar a la cola
  if (Object.keys(activeDownloads).length > 0) {
    downloadQueue.push({ userId, conn, text, m, command });
    return notifyUserAddedToQueue(m, conn);
  }

  // Iniciar la descarga
  await processDownloadRequest({ userId, conn, text, m, command });
};

// Procesar la solicitud de descarga
async function processDownloadRequest({ userId, conn, text, m, command }) {
  activeDownloads[userId] = true; // Marcar al usuario como activo

  try {
    m.reply("⏳ Procesando tu solicitud, espera un momento...");

    // Buscar el video
    const searchResult = await yts(text);
    const video = searchResult.videos[0];
    if (!video) {
      delete activeDownloads[userId];
      return m.reply("❌ No se encontraron resultados para tu consulta.");
    }

    // Validar duración
    if (video.duration.seconds >= 3600) {
      delete activeDownloads[userId];
      return m.reply("❌ El video es demasiado largo. Máximo permitido: 1 hora.");
    }

    // Obtener URLs de descarga
    const res = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`);
    const videoData = res.data.result;
    if (!videoData || !videoData.download.video || !videoData.download.audio) {
      delete activeDownloads[userId];
      return m.reply("❌ No se pudo obtener las URLs del video/audio.");
    }

    const videoUrl = videoData.download.video;
    const audioUrl = videoData.download.audio;

    // Obtener miniatura
    const thumbBuffer = await getBuffer(video.thumbnail);

    // Enviar el video
    m.reply("🎥 Descargando video...");
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        fileName: `${video.title}.mp4`,
        jpegThumbnail: thumbBuffer,
        caption: `🎥 *Título:* ${video.title}\n📽 *Fuente:* ${video.url}\n⏳ *Duración:* ${video.timestamp}`,
      },
      { quoted: m }
    );
    m.reply("✅ Video descargado con éxito.");

    // Enviar el audio
    m.reply("🎶 Descargando audio...");
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`,
        jpegThumbnail: thumbBuffer,
      },
      { quoted: m }
    );
    m.reply("✅ Audio descargado con éxito.");
  } catch (e) {
    console.error("Error en el proceso:", e);
    m.reply(`❌ Error al procesar tu solicitud: ${e.message}`);
  } finally {
    delete activeDownloads[userId]; // Liberar al usuario activo
    processNextInQueue(); // Procesar la siguiente solicitud en la cola
  }
}

// Procesar la siguiente solicitud en la cola
function processNextInQueue() {
  if (downloadQueue.length > 0) {
    const nextRequest = downloadQueue.shift();
    processDownloadRequest(nextRequest);
  }
}

// Notificar al usuario que tiene una solicitud activa
async function notifyUserActiveRequest(m, conn) {
  await conn.sendMessage(
    m.chat,
    { text: "⚠️ Ya tienes una solicitud en proceso. Por favor espera a que termine." },
    { quoted: m }
  );
}

// Notificar al usuario que fue añadido a la cola
async function notifyUserAddedToQueue(m, conn) {
  await conn.sendMessage(
    m.chat,
    { text: "📥 Tu solicitud ha sido añadida a la cola. Se procesará pronto." },
    { quoted: m }
  );
}

// Obtener buffer de imágenes
async function getBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return res.data;
}

handler.help = ["playvid *<consulta>*"];
handler.tags = ["downloader"];
handler.command = /^(playvid|playvideo)$/i;

export default handler;
