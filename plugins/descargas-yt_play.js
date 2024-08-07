import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
    if (!text) throw `${lenguajeGB['smsAvisoMG']()}${mid.smsMalused4}\n*${usedPrefix + command} Billie Eilish - Bellyache*`;
    try {
        const yt_play = await search(args.join(' '));
        const videoUrl = yt_play[0].url;
        const title = yt_play[0].title;

        // Descargar audio en MP3 de la máxima calidad
        const audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });

        // Descargar video en la máxima calidad
        const videoStream = ytdl(videoUrl, { quality: 'highest' });

        // Enviar la descarga del audio
        await conn.sendMessage(m.chat, {
            audio: { url: audioStream },
            caption: `🎵 *Audio MP3* - ${title}`
        });

        // Enviar la descarga del video
        await conn.sendMessage(m.chat, {
            video: { url: videoStream },
            caption: `🎥 *Video MP4* - ${title}`
        });

    } catch (e) {
        await conn.reply(m.chat, `${lenguajeGB['smsMalError3']()}#report ${lenguajeGB['smsMensError2']()} ${usedPrefix + command}\n\n${wm}`, fkontak, m);
        console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`);
        console.log(e);
        handler.limit = 0;
    }
};

handler.command = ['play', 'play2', 'play3', 'play4'];

export default handler;

async function search(query, options = {}) {
    const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
    return search.videos;
}
