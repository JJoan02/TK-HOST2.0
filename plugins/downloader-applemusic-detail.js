import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Ejemplo de uso: ${usedPrefix + command} <link de Apple Music>`;

  const getAlbumDetails = async (url) => {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      return {
        albumTitle: $('h1[data-testid="non-editable-product-title"]').text().trim(),
        artistName: $('a[data-testid="click-action"]').first().text().trim(),
        releaseInfo: $('div.headings__metadata-bottom').text().trim(),
        description: $('div[data-testid="description"]').text().trim(),
      };
    } catch (error) {
      console.error("Error:", error.message);
      return null;
    }
  };

  const albumDetails = await getAlbumDetails(text);

  if (!albumDetails) throw 'No se pudieron obtener los detalles del álbum.';

  const responseText = `
✦ **APPLE MUSIC DETAILS** ✧
- Album: ${albumDetails.albumTitle}
- Artista: ${albumDetails.artistName}
- Publicado: ${albumDetails.releaseInfo}
- Descripción: ${albumDetails.description}
  `;
  m.reply(responseText);
};

handler.help = ['applemusicdetail <link>'];
handler.tags = ['info'];
handler.command = /^(applemusicdetail)$/i;

export default handler;
