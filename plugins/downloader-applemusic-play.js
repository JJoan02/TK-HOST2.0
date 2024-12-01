import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `❌ Uso correcto: ${usedPrefix + command} <Nombre de la canción>. ¡Reproduce con Admin-TK!`;

  const searchAppleMusicTK = async (query) => {
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
      console.error("⚠️ Error TK:", error.message);
      return null;
    }
  };

  await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

  const firstResultLink = await searchAppleMusicTK(text);

  if (!firstResultLink) throw '⚠️ Admin-TK no encontró resultados.';

  m.reply(`🎶 **Admin-TK está reproduciendo:** ${firstResultLink}`);
  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
};

handler.help = ['applemusicplay <consulta>'];
handler.tags = ['downloader'];
handler.command = /^(applemusicplay|aplay)$/i;

export default handler;
