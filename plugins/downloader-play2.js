import yts from 'yt-search';

const handler = async (m, { conn, usedPrefix, text, command }) => {
  try {
    if (!text) {
      throw `🌟 *Admin-TK te pregunta:*\n\n¿Qué deseas buscar? Escribe el título después del comando.\n\n📌 Ejemplo: *${usedPrefix}${command} Joji - Glimpse of Us*`;
    }

    // Reacción de inicio
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

    // Realizar búsqueda en YouTube
    const result = await yts(text);
    const ytres = result.videos;

    if (!ytres || ytres.length === 0) {
      throw '❌ No se encontraron resultados. Intenta con otro término.';
    }

    // Generar lista de resultados
    const listSections = ytres.map((v, index) => ({
      title: `${index + 1}┃ ${v.title}`,
      rows: [
        {
          title: '💿 Descargar MP3',
          description: `🎵 Título: ${v.title}\n⏳ Duración: ${v.timestamp}\n👁️ Vistas: ${v.views.toLocaleString()}`,
          rowId: `${usedPrefix}fgmp3 ${v.url}`,
        },
        {
          title: '📀 Descargar MP4',
          description: `🎥 Título: ${v.title}\n⏳ Duración: ${v.timestamp}\n👁️ Vistas: ${v.views.toLocaleString()}`,
          rowId: `${usedPrefix}fgmp4 ${v.url}`,
        },
      ],
    }));

    // Enviar lista interactiva
    await conn.sendList(
      m.chat,
      '🔰 Admin-TK Downloader',
      `🎥 *Resultados para:* ${text}\n\nSelecciona una opción para continuar.`,
      'Opciones de Descarga',
      listSections,
      m
    );
  } catch (error) {
    console.error(error.message || error);
    await conn.reply(m.chat, `❌ *Error:* ${error.message || 'Algo salió mal.'}`, m);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['play2'];
handler.tags = ['downloader'];
handler.command = ['play2', 'playvid2', 'playlist', 'playlista'];
handler.disabled = false;

export default handler;
          
