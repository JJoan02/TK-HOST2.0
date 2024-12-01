import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw m.reply(`🍎 **Admin-TK** 🍎\n\n*Uso del comando:*\n\`${usedPrefix + command} <enlace o consulta>\`\nEjemplo:\n\`${usedPrefix + command} https://music.apple.com/us/album/...\`\n\`${usedPrefix + command} Joji - Glimpse of Us\``);
  }

  const appledown = {
    getData: async (urls) => {
      const url = `https://aaplmusicdownloader.com/api/applesearch.php?url=${urls}`;
      try {
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Admin-TK/1.0 🍎',
            'Referer': 'https://aaplmusicdownloader.com/'
          }
        });
        return response.data;
      } catch (error) {
        console.error("Error:", error.message);
        return { success: false, message: error.message };
      }
    },
    getAudio: async (trackName, artist, urlMusic, token) => {
      const url = 'https://aaplmusicdownloader.com/api/composer/swd.php';
      const data = {
        song_name: trackName,
        artist_name: artist,
        url: urlMusic,
        token: token
      };
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Admin-TK/1.0 🍎',
        'Referer': 'https://aaplmusicdownloader.com/song.php#'
      };
      try {
        const response = await axios.post(url, qs.stringify(data), { headers });
        return response.data.dlink;
      } catch (error) {
        console.error("Error:", error.message);
        return null;
      }
    },
    download: async (urls) => {
      const musicData = await appledown.getData(urls);
      if (musicData) {
        const encodedData = encodeURIComponent(JSON.stringify([
          musicData.name,
          musicData.albumname,
          musicData.artist,
          musicData.thumb,
          musicData.duration,
          musicData.url
        ]));
        const url = 'https://aaplmusicdownloader.com/song.php';
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Admin-TK/1.0 🍎',
          'Referer': 'https://aaplmusicdownloader.com/'
        };
        try {
          const response = await axios.post(url, `data=${encodedData}`, { headers });
          const $ = cheerio.load(response.data);
          const trackName = $('td:contains("Track Name:")').next().text();
          const artist = $('td:contains("Artist:")').next().text();
          const thumb = $('figure.image img').attr('src');
          const token = $('a#download_btn').attr('token');
          const downloadLink = await appledown.getAudio(trackName, artist, urls, token);

          return {
            name: trackName,
            artist: artist,
            url: urls,
            thumb: thumb,
            download: downloadLink
          };
        } catch (error) {
          console.error("Error:", error.message);
          return null;
        }
      }
    }
  };

  const searchMusic = async (query) => {
    const url = `https://music.apple.com/us/search?term=${query}`;
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const result = $('.desktop-search-page .section[data-testid="section-container"] .grid-item').first();
      const link = result.find('.click-action').attr('href');
      return link;
    } catch (error) {
      console.error("Error:", error.message);
      return null;
    }
  };

  conn.sendMessage(m.chat, { react: { text: "🍎", key: m.key } });

  let finalData;
  if (text.startsWith('http')) {
    finalData = await appledown.download(text);
  } else {
    const searchResult = await searchMusic(text);
    if (searchResult) {
      finalData = await appledown.download(searchResult);
    } else {
      throw m.reply(`🍎 **Admin-TK** 🍎\n\nNo se encontraron resultados para: *${text}*`);
    }
  }

  if (finalData) {
    const { name, artist, url, thumb, download } = finalData;

    m.reply(`🍎 **Admin-TK** 🍎\n\n🎶 *Enviando música:*\n📀 *Título:* ${name}\n👤 *Artista:* ${artist}\n🔗 *URL:* ${url}`);

    const doc = {
      audio: { url: download },
      mimetype: 'audio/mp4',
      fileName: `${name}.mp3`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: url,
          title: name,
          sourceUrl: url,
          thumbnail: await (await conn.getFile(thumb)).data
        }
      }
    };

    await conn.sendMessage(m.chat, doc, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } else {
    m.reply(`🍎 **Admin-TK** 🍎\n\n⚠️ *Error al obtener la música. Intenta nuevamente.*`);
  }
};

handler.help = ['applemusic', 'aplay <consulta>'];
handler.tags = ['downloader'];
handler.command = /^(applemusic|aplay)$/i;

export default handler;
