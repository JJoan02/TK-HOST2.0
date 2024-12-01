case 'play': {
if (!text || text.trim() === "") return reply(`Contoh: ${prefix + command} sephia`);
reply(mess.wait);
try {
const axios = require("axios");
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
if (!video) return reply('Video/Audio Tidak Ditemukan');
if (video.duration.seconds >= 3600) {
return reply('Video is longer than 1 hour!');
}
const audioUrl = video.download.audio;
const videoUrl = video.download.video;
if (!audioUrl || !videoUrl) {
return reply("Gagal mendapatkan audio/video URL. Silakan coba lagi.");
}
const thumbBuffer = await getBuffer(video.thumbnail);
await KhaerulZx.sendMessage(m.chat, {
video: {
url: videoUrl
},
mimetype: 'video/mp4',
fileName: `${video.title}.mp4`,
jpegThumbnail: thumbBuffer,
caption: `🎥 *${video.title}*\n📽 *Source*: ${video.url}`
}, {
quoted: m
});
await KhaerulZx.sendMessage(m.chat, {
audio: {
url: audioUrl
},
mimetype: 'audio/mpeg',
fileName: `${video.title}.mp3`,
jpegThumbnail: thumbBuffer
}, {
quoted: m
});
} catch (e) {
reply(`*Error:* ${e.message}`);
}
};
break
