import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Debes proporcionar un enlace o descripción.\n\nEjemplo: *${usedPrefix}${command} Rosa pastel*`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  const appleMusic = {
    search: async (query) => {
      const url = `https://music.apple.com/us/search?term=${query}`;
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const results = [];
        $('.desktop-search-page .section[data-testid="section-container"] .grid-item').each((index, element) => {
          const title = $(element).find('.top-search-lockup__primary__title').text().trim();
          const subtitle = $(element).find('.top-search-lockup__secondary').text().trim();
          const link = $(element).find('.click-action').attr('href');
          results.push({ title, subtitle, link });
        });
        return results;
      } catch (error) {
        console.error("Error en búsqueda:", error.message);
        throw new Error("⚠️ Error al buscar en Apple Music.");
      }
    },
    download: async (urls) => {
      const apiURL = `https://aaplmusicdownloader.com/api/applesearch.php?url=${urls}`;
      try {
        const response = await axios.get(apiURL, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'MyApp/1.0',
          },
        });

        const musicData = response.data;

        if (!musicData.duration || parseInt(musicData.duration) === 0) {
          throw new Error("⚠️ El audio tiene una duración inválida o es de 0 segundos.");
        }

        return {
          name: musicData.name,
          albumname: musicData.albumname,
          artist: musicData.artist,
          thumb: musicData.thumb,
          duration: musicData.duration,
          url: musicData.url,
        };
      } catch (error) {
        console.error("Error en descarga:", error.message);
        throw new Error("⚠️ Error al descargar la música. Intenta con otro enlace.");
      }
    },
  };

  try {
    let statusMessage = await conn.sendMessage(m.chat, { text: '🎵 Procesando solicitud...' }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const musicData = text.startsWith("http")
      ? await appleMusic.download(text)
      : await appleMusic.download((await appleMusic.search(text))[0].link);

    const { name, artist, albumname, duration, url, thumb } = musicData;

    // Mensaje con los detalles del audio descargado
    await conn.sendMessage(m.chat, {
      text: `🔰 *Admin-TK Apple Music Downloader*\n\n🎵 *Título:* ${name}\n🎤 *Artista:* ${artist}\n📀 *Álbum:* ${albumname || 'N/A'}\n⏳ *Duración:* ${duration}\n🔗 *Enlace:* ${url}\n\n✅ *Audio descargado con éxito.*`,
    }, { quoted: m });

    // Enviar el audio
    const doc = {
      audio: { url },
      mimetype: 'audio/mp4',
      fileName: `${name}.mp3`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: url,
          title: name,
          sourceUrl: url,
          thumbnail: await (await conn.getFile(thumb)).data,
        },
      },
    };

    await conn.sendMessage(m.chat, doc, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error("Error:", error.message);
    await conn.sendMessage(m.chat, {
      text: error.message || "⚠️ Ocurrió un error inesperado. Intenta nuevamente más tarde.",
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['applemusicsearch', 'applemusicdetail', 'applemusicplay', 'aplay'];
handler.tags = ['downloader'];
handler.command = /^(aplay|applemusicplay)$/i;

export default handler;
