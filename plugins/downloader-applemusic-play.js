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
      return results[0]?.link;
    } catch (error) {
      console.error("Error:", error.message);
      return null;
    }
  };

  const firstResultLink = await searchAppleMusic(text);

  if (!firstResultLink) throw 'No se encontraron resultados.';

  m.reply(`Reproduciendo: ${firstResultLink}`);
};

handler.help = ['applemusicplay <consulta>'];
handler.tags = ['downloader'];
handler.command = /^(applemusicplay|aplay)$/i;

export default handler;
