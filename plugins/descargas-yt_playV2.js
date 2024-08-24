import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import fs from 'fs';

// Helper function to handle errors
const handleError = async (conn, m, command, usedPrefix, error) => {
    await conn.reply(m.chat, `${lenguajeGB['smsMalError3']()}#report ${lenguajeGB['smsMensError2']()} ${usedPrefix + command}\n\n${wm}`, m);
    console.error(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`);
    console.error(error);
};

// Helper function to fetch media URL
const fetchMediaUrl = async (text, type) => {
    const res = await fetch(`https://violetics.pw/api/media/youtube-play?apikey=beta&query=${text}`);
    const json = await res.json();
    return json.result.url;
};

// Function to handle audio and video commands
const handleMediaRequest = async (m, command, conn, text, usedPrefix) => {
    try {
        const mediaType = command === 'play.1' ? 'audio' : 'video';
        const msgText = command === 'play.1' ? mid.smsAud : mid.smsVid;
        const fileName = command === 'play.1' ? 'error.mp3' : 'error.mp4';
        const mimeType = command === 'play.1' ? 'audio/mp4' : null;

        await conn.reply(m.chat, lenguajeGB['smsAvisoEG']() + msgText, m, {
            contextInfo: {
                externalAdReply: {
                    mediaUrl: null,
                    mediaType: 1,
                    description: null,
                    title: wm,
                    body: '𝗦𝘂𝗽𝗲𝗿 𝗝𝗼𝗮𝗻𝗕𝗼𝘁-𝗧𝗞 - 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽',
                    previewType: 0,
                    thumbnail: joanImg,
                    sourceUrl: accountsgb
                }
            }
        });

        try {
            const mediaUrl = await fetchMediaUrl(text, mediaType);
            if (mediaType === 'audio') {
                await conn.sendMessage(m.chat, {
                    audio: { url: mediaUrl },
                    fileName: fileName,
                    mimetype: mimeType
                }, { quoted: m });
            } else {
                await conn.sendFile(m.chat, mediaUrl, fileName, `${wm}`, m);
            }
        } catch (error) {
            await handleError(conn, m, command, usedPrefix, error);
        }
    } catch (error) {
        await handleError(conn, m, command, usedPrefix, error);
    }
};

const handler = async (m, { command, usedPrefix, conn, text }) => {
    if (!text) throw `${mg}${mid.smsMalused4}\n*${usedPrefix + command} Billie Eilish - Bellyache*`;

    await handleMediaRequest(m, command, conn, text, usedPrefix);
};

handler.help = ['play.1', 'play.2'].map(v => v + ' <texto>');
handler.tags = ['downloader'];
handler.command = ['play.1', 'play.2'];
handler.limit = 1;

export default handler;

function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

async function ytMp3(url) {
    try {
        const getUrl = await ytdl.getInfo(url);
        const result = getUrl.formats
            .filter(item => item.mimeType === 'audio/webm; codecs="opus"')
            .map(async (item) => {
                const bytes = await bytesToSize(item.contentLength);
                return { audio: item.url, size: bytes };
            });
        const resultFix = (await Promise.all(result)).filter(x => x.audio && x.size);
        const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`);
        const tinyUrl = tiny.data;
        const title = getUrl.videoDetails.title;
        const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
        return { title, result: tinyUrl, result2: resultFix, thumb };
    } catch (error) {
        throw error;
    }
}

async function ytMp4(url) {
    try {
        const getUrl = await ytdl.getInfo(url);
        const result = getUrl.formats
            .filter(item => item.container === 'mp4' && item.hasVideo && item.hasAudio)
            .map(async (item) => {
                const bytes = await bytesToSize(item.contentLength);
                return { video: item.url, quality: item.qualityLabel, size: bytes };
            });
        const resultFix = (await Promise.all(result)).filter(x => x.video && x.size && x.quality);
        const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`);
        const tinyUrl = tiny.data;
        const title = getUrl.videoDetails.title;
        const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
        return { title, result: tinyUrl, result2: resultFix[0].video, thumb };
    } catch (error) {
        throw error;
    }
}

async function ytPlay(query) {
    try {
        const getData = await yts(query);
        const result = getData.videos.slice(0, 5);
        const url = result.map(video => video.url);
        const random = url[0];
        const getAudio = await ytMp3(random);
        return getAudio;
    } catch (error) {
        throw error;
    }
}

async function ytPlayVid(query) {
    try {
        const getData = await yts(query);
        const result = getData.videos.slice(0, 5);
        const url = result.map(video => video.url);
        const random = url[0];
        const getVideo = await ytMp4(random);
        return getVideo;
    } catch (error) {
        throw error;
    }
}
