// Importación de módulos
import got from 'got';
import cheerio from 'cheerio';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import { BioskopArgsSchema, BioskopSchema, BioskopNowSchema } from '../index.js';

// Configuración de opciones para solicitudes HTTP
const requestOptions = {
    headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        Host: 'jadwalnonton.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
    }
};

// Función para obtener películas en cartelera
export async function bioskopNow() {
    const url = 'https://jadwalnonton.com/now-playing/';
    
    try {
        const response = await got(url, requestOptions).text();
        const $ = cheerio.load(response);
        const results = [];

        $('div.row > div.item.movie').each((_, el) => {
            const $el = $(el);
            const title = $el.find('h2 > a').text().trim();
            const img = $el.find('img.poster').attr('src');
            const movieUrl = $el.find('a.mojadwal').attr('href');
            const $span = $el.find('div > span.moket');
            const genre = $span.eq(0).text().trim();
            const duration = $span.eq(1).text().trim();
            const playingAt = ($el.find('div > i.icon').attr('class') || '').replace(/icon/, '').trim();

            if (title && movieUrl) {
                results.push({ title, img, url: movieUrl, genre, duration, playingAt });
            }
        });

        if (results.length === 0) {
            throw new Error(`No results for ${url}\n\n${response}`);
        }

        return results.map(res => BioskopNowSchema.parse(res));
    } catch (error) {
        console.error(`Error in bioskopNow: ${error.message}`);
        throw error;
    }
}

// Función para obtener películas próximas
export async function bioskop(page = 1) {
    try {
        BioskopArgsSchema.parse({ page });
        page = Math.min(4, Math.max(1, parseInt(page)));
        const url = `https://jadwalnonton.com/comingsoon/?page=${page}`;
        const response = await got(url, requestOptions).text();
        const $ = cheerio.load(response);
        const results = [];

        $('div.row > div.item.movie').each((_, el) => {
            const $el = $(el);
            const title = $el.find('h2 > a').text().trim();
            const img = $el.find('img.poster').attr('src');
            const movieUrl = $el.find('a.mojadwal').attr('href');
            const $span = $el.find('div.rowl > div > span');
            const genre = $span.eq(0).text().trim();
            const duration = $span.eq(1).text().trim();
            const release = $span.eq(2).text().trim();
            const director = $span.eq(4).text().trim();
            const cast = $span.eq(6).text().trim();

            if (title && movieUrl) {
                results.push({ title, img, url: movieUrl, genre, duration, release, director, cast });
            }
        });

        if (results.length === 0) {
            throw new Error(`No results for page ${page}\n\n${response}`);
        }

        return results.map(res => BioskopSchema.parse(res));
    } catch (error) {
        console.error(`Error in bioskop: ${error.message}`);
        throw error;
    }
}

// Función para manejar comandos relacionados con YouTube
export const handler = async (m, { conn, command, args, text, usedPrefix }) => {
    if (!text) throw `${lenguajeGB['smsAvisoMG']()}${mid.smsMalused4}\n*${usedPrefix + command} Billie Eilish - Bellyache*`;

    try {
        const yt_play = await search(args.join(" "));
        if (yt_play.length === 0) throw 'No se encontraron resultados para la búsqueda.';

        let additionalText = command === 'play' ? '𝘼𝙐𝘿𝙄𝙊 🔊' : '𝙑𝙄𝘿𝙀𝙊 🎥';
        let captionvid = `𓆩 𓃠 𓆪 ✧═══ ${vs} ═══✧ 𓆩 𓃠 𓆪*

        ও ${mid.smsYT1}
        »  ${yt_play[0].title}
        ﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
        ও ${mid.smsYT15}
        » ${yt_play[0].ago}
        ﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
        ও ${mid.smsYT5}
        » ${secondString(yt_play[0].duration.seconds)}
        ﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
        ও  ${mid.smsYT10}
        » ${MilesNumber(yt_play[0].views)}
        ﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
        ও  ${mid.smsYT4}
        » ${yt_play[0].url}
        ﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
        ও ${mid.smsAguarde(additionalText)}

        *𓆩 𓃠 𓆪 ✧═══ ${vs} ═══✧ 𓆩 𓃠 𓆪*`;

        await conn.sendMessage(m.chat, {
            text: captionvid,
            contextInfo: {
                externalAdReply: {
                    title: yt_play[0].title,
                    body: packname,
                    thumbnailUrl: yt_play[0].thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        if (command === 'play') {
            await handleAudio(m, yt_play, conn);
        } else if (command === 'play2') {
            await handleVideo(m, yt_play, conn);
        }
    } catch (error) {
        handler.limit = 0;
        console.error(`Error in handler: ${error.message}`);
    }
};

// Función para manejar la descarga de audio
async function handleAudio(m, yt_play, conn) {
    try {
        let q = '128kbps';
        let v = yt_play[0].url;
        const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v));
        const dl_url = await yt.audio[q].download();
        const ttl = await yt.title;

        await conn.sendMessage(m.chat, {
            audio: { url: dl_url },
            mimetype: 'audio/mpeg',
            contextInfo: {
                externalAdReply: {
                    title: ttl,
                    body: "",
                    thumbnailUrl: yt_play[0].thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    } catch (error) {
        console.error(`Error in handleAudio: ${error.message}`);
        await handleAudioFallback(m, yt_play, conn, error);
    }
}

// Función de respaldo para descargar audio
async function handleAudioFallback(m, yt_play, conn, error) {
    try {
        let q = '128kbps';
        let v = yt_play[0].url;
        let dl_url = (await ytdl.getInfo(v)).formats.find(f => f.itag === 140)?.url;
        const ttl = yt_play[0].title;

        await conn.sendMessage(m.chat, {
            audio: { url: dl_url },
            mimetype: 'audio/mpeg',
            contextInfo: {
                externalAdReply: {
                    title: ttl,
                    body: "",
                    thumbnailUrl: yt_play[0].thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    } catch (error) {
        console.error(`Error in handleAudioFallback: ${error.message}`);
    }
}

// Función para manejar la descarga de video
async function handleVideo(m, yt_play, conn) {
    try {
        const url = yt_play[0].url;
        const yt = await youtubedl(url).catch(async _ => await youtubedlv2(url));
        const dl_url = yt.video['360p'].download();

        await conn.sendMessage(m.chat, {
            video: { url: dl_url },
            mimetype: 'video/mp4',
            contextInfo: {
                externalAdReply: {
                    title: yt_play[0].title,
                    body: "",
                    thumbnailUrl: yt_play[0].thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    } catch (error) {
        console.error(`Error in handleVideo: ${error.message}`);
    }
}

// Función para buscar videos en YouTube
async function search(query) {
    return new Promise((resolve, reject) => {
        yts(query, (err, res) => {
            if (err) return reject(err);
            resolve(res.videos);
        });
    });
}

