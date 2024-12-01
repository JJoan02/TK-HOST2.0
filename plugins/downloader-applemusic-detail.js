import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `❌ Uso correcto: ${usedPrefix + command} <link de Apple Music>. ¡Consulta rápida estilo Admin-TK!`;

  const getAlbumDetailsTK = async (url) => {
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
      console.error("⚠️ Error TK:", error.message);
      return null;
    }
  };

  await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

  const albumDetails = await getAlbumDetailsTK(text);

  if (!albumDetails) throw '⚠️ ¡Oh no! Admin-TK no pudo obtener los detalles del álbum.';

  const responseText = `
✨ **ADMIN-TK: DETALLES DEL ÁLBUM** ✨
🎵 **Álbum:** ${albumDetails.albumTitle}
🎤 **Artista:** ${albumDetails.artistName}
📅 **Publicado:** ${albumDetails.releaseInfo}
📝 **Descripción:** ${albumDetails.description}
  `;

  m.reply(responseText);
  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
};

handler.help = ['applemusicdetail <link>'];
handler.tags = ['info'];
handler.command = /^(applemusicdetail)$/i;

export default handler;
