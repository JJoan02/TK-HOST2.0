import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw m.reply(`Ejemplo de uso: ${usedPrefix + command} <link o descripción>`);

  const appleMusic = {
    // Búsqueda de canciones o álbumes en Apple Music
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
        console.error("Error en búsqueda:", error.response ? error.response.data : error.message);
        throw new Error("Error al buscar en Apple Music.");
      }
    },

    // Obtener detalles de un álbum o canción desde un enlace
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
        console.error("Error en detalles:", error.response ? error.response.data : error.message);
        throw new Error("Error al obtener los detalles de la música.");
      }
    },
  };

  const appledown = {
    // Descargar datos de una canción desde un enlace
    download: async (urls) => {
      const url = `https://aaplmusicdownloader.com/api/applesearch.php?url=${urls}`;
      try {
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'MyApp/1.0',
            'Referer': 'https://aaplmusicdownloader.com/',
          },
        });

        const musicData = response.data;

        // Validar duración del audio
        if (!musicData.duration || parseInt(musicData.duration) === 0) {
          throw new Error("El audio tiene una duración inválida o es de cero segundos.");
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
        console.error("Error en descarga:", error.response ? error.response.data : error.message);
        throw new Error("Error al descargar la música. Verifica el enlace o inténtalo más tarde.");
      }
    },
  };

  try {
    switch (command) {
      case "applemusicsearch":
        const searchResults = await appleMusic.search(text);
        if (!searchResults || searchResults.length === 0) {
          return m.reply("No se encontraron resultados. Por favor, intenta con otra descripción.");
        }
        const searchText = searchResults
          .map((v, i) => `${i + 1}. *${v.title}*\n   Link: ${v.link}`)
          .join('\n\n');
        m.reply(searchText);
        break;

      case "applemusicdetail":
        const details = await appleMusic.detail(text);
        const detailText = `\`✦ APPLE MUSIC DETAILS ✧\`\n\n✦ - Album: ${details.albumTitle}\n✧ - Artista: ${details.artistName}\n✦ - Publicado: ${details.releaseInfo}\n✧ - Descripción: ${details.description}`;
        m.reply(detailText);
        break;

      case "applemusicplay":
      case "aplay":
        if (text.startsWith("http")) {
          // Descargar directamente desde el enlace
          const musicData = await appledown.download(text);
          const { name, artist, duration, thumb, url } = musicData;

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
          m.reply(`_✧ Música enviada: ${name} (${artist}/${duration})_`);
        } else {
          // Buscar y descargar desde descripción
          const searchResults = await appleMusic.search(text);
          if (!searchResults || searchResults.length === 0) {
            return m.reply("No se encontraron resultados. Por favor, intenta con otra descripción.");
          }

          const firstResult = searchResults[0];
          const musicData = await appledown.download(firstResult.link);
          const { name, artist, duration, thumb, url } = musicData;

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
          m.reply(`_✧ Música enviada: ${name} (${artist}/${duration})_`);
        }
        break;

      default:
        m.reply("Comando no reconocido.");
    }
  } catch (error) {
    m.reply(error.message || "Ocurrió un error al procesar tu solicitud.");
  }
};

handler.help = ['applemusicsearch', 'applemusicdetail', 'applemusicplay'];
handler.tags = ['downloader', 'search', 'info'];
handler.command = /^(applemusicsearch|applemusicdetail|applemusicplay|aplay)$/i;

export default handler;
