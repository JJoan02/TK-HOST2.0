import axios from "axios";
import ffmpeg from "fluent-ffmpeg"
import yts from "yt-search"
import _ from "lodash"
import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
if (!text || text.trim() === "") return m.reply(`Ejemplo: ${usedPrefix + command} 505`);
m.reply(wait);
try {
async function getBuffer(url) {
const res = await axios({
method: 'get',
url,
responseType: 'arraybuffer'
});
return res.data;
}
const res = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`);
const video = res.data.result;
if (!video) return m.reply('Video/Audio no encontrado');
if (video.duration.seconds >= 3600) {
return reply('El audio es demasiado largo!');
}
const audioUrl = video.download.audio;
const videoUrl = video.download.video;
if (!audioUrl || !videoUrl) {
return reply("No se pudo obtener la URL de audio/vídeo. Por favor inténtalo de nuevo.");
}
const thumbBuffer = await getBuffer(video.thumbnail);
//await conn.sendMessage(m.chat, { video: { url: videoUrl }, mimetype: 'video/mp4', fileName: `${video.title}.mp4`, jpegThumbnail: thumbBuffer, caption: `🎥 *${video.title}*\n📽 *Fuente*: ${video.url}` }, { quoted: m });
await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, jpegThumbnail: thumbBuffer }, { quoted: m });
} catch (e) {
m.reply(`*Error:* ${e.message}`);
}
}
handler.help = ["play *<consulta>*"]
handler.tags = ["downloader"]
handler.command = /^(play|ytplay)$/i

export default handler
