import yts from 'yt-search';
import axios from 'axios';
import { yta, ytv } from 'api-dylux'; // Herramientas para descargar audio/video
import { Flask, request, jsonify } from 'flask';
import { YouTube } from 'pytube';
import re;

const app = Flask(__name__);

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `⚠️ *Admin-TK:*

Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* ${usedPrefix}${command} Joji Ew`,
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
    const infoText = `🔰 *Admin-TK Downloader*

🎥 *Título:* ${title}
⏳ *Duración:* ${timestamp}
👁️ *Vistas:* ${views.toLocaleString()}
📅 *Publicado:* ${ago}
🌐 *Enlace:* ${url}`;
    await conn.reply(m.chat, infoText, m);

    // Descargar video en máxima calidad
    try {
      let videoData;
      const qualities = ["1080p", "720p", "480p", "360p"];
      for (const quality of qualities) {
        try {
          videoData = await ytv(url, quality);
          if (videoData) break;
        } catch (e) {
          continue;
        }
      }

      if (!videoData) {
        throw new Error("No se encontró una calidad disponible.");
      }

      const { dl_url: videoUrl, size: videoSize } = videoData;

      if (parseFloat(videoSize.split("MB")[0]) > 1000) {
        return conn.reply(
          m.chat,
          `❌ *El archivo MP4 es demasiado grande (${videoSize}). Intenta con otro video.*`,
          m
        );
      }

      await conn.sendMessage(
        m.chat,
        { video: { url: videoUrl }, caption: `🎥 *Video descargado con éxito.*

🔰 *Admin-TK*`, fileName: `${title}.mp4` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error al descargar el video:", error.message);
      await conn.reply(m.chat, "❌ *No se pudo descargar el video en alta calidad.*", m);
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

handler.help = ["play2"].map((v) => v + " <título o enlace>");
handler.tags = ["downloader"];
handler.command = ["play2"];
handler.register = true;

// Flask API code
function download_video(url, resolution) {
  try {
    const yt = new YouTube(url);
    const stream = yt.streams.filter(stream => stream.progressive && stream.file_extension === 'mp4' && stream.resolution === resolution).first();
    if (stream) {
      stream.download();
      return [true, null];
    } else {
      return [false, "Video with the specified resolution not found."];
    }
  } catch (e) {
    return [false, e.message];
  }
}

function get_video_info(url) {
  try {
    const yt = new YouTube(url);
    const stream = yt.streams.first();
    const video_info = {
      "title": yt.title,
      "author": yt.author,
      "length": yt.length,
      "views": yt.views,
      "description": yt.description,
      "publish_date": yt.publish_date,
    };
    return [video_info, null];
  } catch (e) {
    return [null, e.message];
  }
}

function is_valid_youtube_url(url) {
  const pattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+(&\S*)?$/;
  return pattern.test(url);
}

app.route('/download/<resolution>', { methods: ['POST'] }, function download_by_resolution(resolution) {
  const data = request.get_json();
  const url = data.url;
  if (!url) {
    return jsonify({ "error": "Missing 'url' parameter in the request body." }), 400;
  }
  if (!is_valid_youtube_url(url)) {
    return jsonify({ "error": "Invalid YouTube URL." }), 400;
  }
  const [success, error_message] = download_video(url, resolution);
  if (success) {
    return jsonify({ "message": `Video with resolution ${resolution} downloaded successfully.` }), 200;
  } else {
    return jsonify({ "error": error_message }), 500;
  }
});

app.route('/video_info', { methods: ['POST'] }, function video_info() {
  const data = request.get_json();
  const url = data.url;
  if (!url) {
    return jsonify({ "error": "Missing 'url' parameter in the request body." }), 400;
  }
  if (!is_valid_youtube_url(url)) {
    return jsonify({ "error": "Invalid YouTube URL." }), 400;
  }
  const [video_info, error_message] = get_video_info(url);
  if (video_info) {
    return jsonify(video_info), 200;
  } else {
    return jsonify({ "error": error_message }), 500;
  }
});

export default handler;
