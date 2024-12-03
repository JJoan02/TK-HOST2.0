import Starlights from "@StarlightsTeam/Scraper";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `🔰 Admin-TK: Ingresa el nombre de la imagen que estás buscando.\n\n✦ Ejemplo:\n> ${usedPrefix + command} Ai Hoshino Icons`
    );
  }

  const prohibitedWords = [
    'caca', 'polla', 'porno', 'porn', 'gore', 'cum', 'semen', 'puta', 'puto', 'culo',
    'putita', 'putito', 'pussy', 'hentai', 'pene', 'coño', 'asesinato', 'zoofilia',
    'mia khalifa', 'desnudo', 'desnuda', 'cuca', 'chocha', 'muertos', 'pornhub', 'xnxx',
    'xvideos', 'teta', 'vagina', 'marsha may', 'misha cross', 'sexmex', 'furry', 'furro',
    'furra', 'xxx', 'rule34', 'panocha', 'pedofilia', 'necrofilia', 'pinga', 'horny', 'ass',
    'nude', 'popo', 'nsfw', 'femdom', 'futanari', 'erofeet', 'sexo', 'sex', 'yuri', 'ero',
    'ecchi', 'blowjob', 'anal', 'ahegao', 'pija', 'verga', 'trasero', 'violation', 'violacion',
    'bdsm', 'cachonda', '+18', 'cp', 'mia marin', 'lana rhoades', 'cogiendo', 'cepesito',
    'hot', 'buceta', 'xxx', 'rule', 'r u l e'
  ];

  if (prohibitedWords.some(word => text.toLowerCase().includes(word))) {
    await m.react('✖️');
    return m.reply('🔰 Admin-TK: Esa búsqueda está prohibida.');
  }

  await m.react('🕓');
  try {
    let { dl_url } = await Starlights.GoogleImage(text);
    await conn.sendFile(
      m.chat,
      dl_url,
      'thumbnail.jpg',
      `🔰 Admin-TK: Resultado para tu búsqueda.\n\n✦ Palabra clave: ${text}`,
      m
    );
    await m.react('✅');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await m.react('✖️');
    await m.reply('🔰 Admin-TK: No se pudo obtener una imagen para tu búsqueda. Intenta con otras palabras.');
  }
};

handler.help = ['imagen *<búsqueda>*'];
handler.tags = ['downloader'];
handler.command = ['image', 'gimage', 'imagen'];

export default handler;
