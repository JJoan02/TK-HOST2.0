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

    detail: async (url) => {
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const albumTitle = $('h1[data-testid="non-editable-product-title"]').text().trim();
        const artistName = $('a[data-testid="click-action"]').first().text().trim();
        const releaseInfo = $('div.headings__metadata-bottom').text().trim();
        const description = $('div[data-testid="description"]').text().trim();
        return { albumTitle, artistName, releaseInfo, description };
      } catch (error) {
        console.error("Error en detalles:", error.message);
        throw new Error("⚠️ Error al obtener los detalles de la música.");
      }
    },
  };

  const appledown = {
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
    switch (command) {
      case "applemusicsearch":
      case "asearch":
        let searchMessage = await conn.sendMessage(m.chat, { text: '🔎 Buscando música en Apple Music...' }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const searchResults = await appleMusic.search(text);
        if (!searchResults || searchResults.length === 0) {
          throw new Error("⚠️ No se encontraron resultados. Intenta con otra descripción.");
        }

        const searchText = searchResults
          .map((v, i) => `${i + 1}. *${v.title}*\n   Link: ${v.link}`)
          .join('\n\n');
        await conn.sendMessage(m.chat, {
          text: `🔰 *Resultados de Búsqueda*\n\n${searchText}`,
          edit: searchMessage.key,
        });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        break;

      case "applemusicdetail":
      case "adetail":
        let detailMessage = await conn.sendMessage(m.chat, { text: '🔍 Obteniendo detalles de Apple Music...' }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const details = await appleMusic.detail(text);
        const detailText = `🔰 *Detalles de la Música*\n\n🎵 *Álbum:* ${details.albumTitle || 'N/A'}\n🎤 *Artista:* ${details.artistName || 'N/A'}\n📅 *Publicado:* ${details.releaseInfo || 'N/A'}\n✍️ *Descripción:* ${details.description || 'N/A'}`;
        await conn.sendMessage(m.chat, {
          text: detailText,
          edit: detailMessage.key,
        });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        break;

      case "applemusicplay":
      case "aplay":
        let statusMessage = await conn.sendMessage(m.chat, { text: '🎵 Descargando de Apple Music...' }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const musicData = text.startsWith("http")
          ? await appledown.download(text)
          : await appledown.download((await appleMusic.search(text))[0].link);

        const { name, artist, albumname, duration, url } = musicData;

        await conn.sendMessage(m.chat, {
          text: `🔰 *Admin-TK Apple Music Downloader*\n\n🎵 *Título:* ${name}\n🎤 *Artista:* ${artist}\n📀 *Álbum:* ${albumname || 'N/A'}\n⏳ *Duración:* ${duration}\n🔗 *Enlace:* ${url}\n\n✅ *Audio descargado con éxito.*`,
          edit: statusMessage.key,
        });

        const doc = {
          audio: { url },
          mimetype: 'audio/mp4',
          fileName: `${name}.mp3`,
        };

        await conn.sendMessage(m.chat, doc, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        break;

      default:
        throw new Error("⚠️ Comando no reconocido.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    await conn.sendMessage(m.chat, { text: error.message || "⚠️ Ocurrió un error inesperado." }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['applemusicsearch', 'applemusicdetail', 'applemusicplay', 'asearch', 'adetail', 'aplay'];
handler.tags = ['downloader', 'search', 'info'];
handler.command = /^(applemusicsearch|asearch|applemusicdetail|adetail|applemusicplay|aplay)$/i;

export default handler;
