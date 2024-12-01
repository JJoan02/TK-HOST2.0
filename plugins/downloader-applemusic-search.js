import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Ejemplo de uso: ${usedPrefix + command} <Nombre de la canción>`;

  const searchAppleMusic = async (query) => {
    const url = `https://music.apple.com/us/search?term=${encodeURIComponent(query)}`;
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const results = [];
      $('.desktop-search-page .section[data-testid="section-container"] .grid-item').each((_, element) => {
        results.push({
          title: $(element).find('.top-search-lockup__primary__title').text().trim(),
          link: $(element).find('.click-action').attr('href'),
        });
      });
      return results;
    } catch (error) {
      console.error("Error:", error.message);
      return [];
    }
  };

  const searchResults = await searchAppleMusic(text);

  if (searchResults.length === 0) throw 'No se encontraron resultados para tu búsqueda.';

  const responseText = searchResults.map((v, i) => `${i + 1}. ${v.title}\nLink: ${v.link}`).join('\n\n');
  m.reply(responseText);
};

handler.help = ['applemusicsearch <consulta>'];
handler.tags = ['search'];
handler.command = /^(applemusicsearch)$/i;

export default handler;
