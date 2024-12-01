import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Necesitas proporcionar un enlace o descripción.\n\nEjemplo: *${usedPrefix}${command} Rosa pastel*`,
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
    download: async (url) => {
      const apiURL = `https://aaplmusicdownloader.com/api/applesearch.php?url=${url}`;
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
          artist: musicData.artist,
          duration: musicData.duration,
          url: musicData.url,
          thumb: musicData.thumb,
        };
      } catch (error) {
        console.error("Error en descarga:", error.message);
        throw new Error("⚠️ Error al descargar la música. Intenta con otro enlace.");
      }
    },
  };

  try {
    let statusMessage = await conn.sendMessage(m.chat, { text: '🔎 Buscando música...' }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let musicData;

    if (text.startsWith("http")) {
      // Si es un enlace, descarga directamente
      musicData = await appleMusic.download(text);
    } else {
      // Si es una descripción, busca primero
      const searchResults = await appleMusic.search(text);
      if (!searchResults || searchResults.length === 0) {
        throw new Error("⚠️ No se encontraron resultados. Intenta con otra descripción.");
      }
      const firstResult = searchResults[0];
      musicData = await appleMusic.download(firstResult.link);
    }

    const { name, artist, duration, url, thumb } = musicData;

    // Actualizar mensaje con detalles
    await conn.sendMessage(m.chat, {
      text: `🔰 *Admin-TK Music Downloader*\n\n🎵 *Título:* ${name}\n🎤 *Artista:* ${artist}\n⏳ *Duración:* ${duration}\n🌐 *Enlace:* ${url}\n\n⬇️ *Preparando descarga...*`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

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
    await conn.sendMessage(m.chat, {
      text: `✅ Música enviada: ${name} (${artist}/${duration})`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error("Error:", error.message);
    await conn.sendMessage(m.chat, {
      text: error.message || '⚠️ Ocurrió un error inesperado. Intenta nuevamente más tarde.',
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['applemusicsearch', 'applemusicdetail', 'applemusicplay', 'aplay'];
handler.tags = ['downloader'];
handler.command = /^(aplay|applemusicplay|applemusicsearch|applemusicdetail)$/i;

export default handler;
