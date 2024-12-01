import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Necesitas proporcionar un enlace de Apple Music.\n\n*Ejemplo:* ${usedPrefix + command} https://music.apple.com/us/album/glimpse-of-us/1625328890?i=1625328892`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  try {
    // Mensaje inicial para analizar el enlace
    let statusMessage = await conn.sendMessage(m.chat, { text: '🔎 Analizando enlace de Apple Music...' }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // Descargar información del enlace
    const musicData = await appledown.download(text);
    if (!musicData || !musicData.download) {
      await conn.sendMessage(m.chat, {
        text: '⚠️ No se pudo descargar la música. Por favor verifica el enlace o inténtalo nuevamente.',
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return;
    }

    // Información de la música
    const { name, albumname, artist, url, thumb, duration, download } = musicData;
    const songInfo = `🔰 *Admin-TK Apple Music Downloader*\n\n🎵 *Título:* ${name}\n🎤 *Artista:* ${artist}\n📀 *Álbum:* ${albumname}\n⏳ *Duración:* ${duration}\n🔗 *Enlace:* ${url}`;

    // Actualizar mensaje con información de la música
    await conn.sendMessage(m.chat, {
      text: `${songInfo}\n\n⬇️ Descargando audio...`,
      edit: statusMessage.key,
    });

    // Descargar y enviar música
    const thumbnailBuffer = await axios.get(thumb, { responseType: 'arraybuffer' }).then(res => res.data);
    await conn.sendMessage(m.chat, {
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
          thumbnail: thumbnailBuffer,
        },
      },
    }, { quoted: m });

    // Mensaje final de éxito
    await conn.sendMessage(m.chat, {
      text: `${songInfo}\n\n✅ Audio descargado con éxito.`,
      edit: statusMessage.key,
    });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error.message);
    await conn.sendMessage(m.chat, {
      text: '⚠️ Ocurrió un error inesperado. Por favor inténtalo nuevamente más tarde.',
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

// Funciones para descargar la música
const appledown = {
  getData: async (url) => {
    try {
      const response = await axios.get(`https://aaplmusicdownloader.com/api/applesearch.php?url=${url}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MyApp/1.0',
          'Referer': 'https://aaplmusicdownloader.com/',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo datos:', error.message);
      return null;
    }
  },
  getAudio: async (trackName, artist, urlMusic, token) => {
    try {
      const response = await axios.post(
        'https://aaplmusicdownloader.com/api/composer/swd.php',
        qs.stringify({
          song_name: trackName,
          artist_name: artist,
          url: urlMusic,
          token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'MyApp/1.0',
            'Referer': 'https://aaplmusicdownloader.com/song.php#',
          },
        }
      );
      return response.data.dlink;
    } catch (error) {
      console.error('Error obteniendo audio:', error.message);
      return null;
    }
  },
  download: async (url) => {
    const musicData = await appledown.getData(url);
    if (!musicData) return null;

    try {
      const encodedData = encodeURIComponent(JSON.stringify([
        musicData.name,
        musicData.albumname,
        musicData.artist,
        musicData.thumb,
        musicData.duration,
        musicData.url,
      ]));

      const response = await axios.post(
        'https://aaplmusicdownloader.com/song.php',
        `data=${encodedData}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'https://aaplmusicdownloader.com/',
          },
        }
      );

      const $ = cheerio.load(response.data);
      const trackName = $('td:contains("Track Name:")').next().text();
      const albumName = $('td:contains("Album:")').next().text();
      const duration = $('td:contains("Duration:")').next().text();
      const artist = $('td:contains("Artist:")').next().text();
      const thumb = $('figure.image img').attr('src');
      const token = $('a#download_btn').attr('token');
      const downloadLink = await appledown.getAudio(trackName, artist, url, token);

      return { name: trackName, albumname: albumName, artist, url, thumb, duration, download: downloadLink };
    } catch (error) {
      console.error('Error descargando música:', error.message);
      return null;
    }
  },
};

handler.help = ['applemusic *<link>*'];
handler.tags = ['downloader'];
handler.command = /^(applemusic)$/i;

export default handler;
