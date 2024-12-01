import { ApiClient, CatalogTypes } from 'applemusic';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Necesitas proporcionar un término de búsqueda.\n\n*Ejemplo:* ${usedPrefix + command} Joji - Ew`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  const DEV_TOKEN = "your_dev_token_here"; // Reemplaza con tu token de desarrollador de Apple Music
  const apiClient = new ApiClient(DEV_TOKEN, storefront="us");

  try {
    let statusMessage = await conn.sendMessage(m.chat, { text: '🔎 Buscando en Apple Music...' }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const searchResults = await apiClient.catalog.search(text, CatalogTypes.Songs);
    if (!searchResults || searchResults.length === 0) {
      await conn.sendMessage(m.chat, {
        text: '⚠️ No se encontraron resultados. Intenta con otro término de búsqueda.',
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return;
    }

    const song = searchResults[0];
    const { name, artist_name, album_name, url, previewUrl, artwork_url } = song;

    const songInfo = `🔰 *Admin-TK Apple Music Downloader*\n\n🎵 *Título:* ${name}\n🎤 *Artista:* ${artist_name}\n📀 *Álbum:* ${album_name}\n🔗 *Enlace:* ${url}\n🎧 *Vista Previa:* ${previewUrl}`;
    await conn.sendMessage(m.chat, {
      text: `${songInfo}\n\n✅ Información proporcionada.`,
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

handler.help = ['aplay *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(applemusicplay|aplay)$/i;

export default handler;
