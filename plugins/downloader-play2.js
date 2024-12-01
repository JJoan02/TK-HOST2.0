// Handler para el comando '.play2'
let play2Handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw m.reply(`⚠️ *Admin-TK:* Necesitas proporcionar una consulta de búsqueda.

*Ejemplo de uso:* *${usedPrefix + command} Joji Ew*`);

  let results = await yts(text);
  let tes = results.videos[0];
  if (!tes) throw m.reply('⚠️ *Admin-TK:* No se encontraron resultados para tu consulta. Por favor intenta ser un poco más específico.');

  let videoUrl = tes.url;

  await conn.sendMessage(m.chat, {
    text: `⚠️ *Admin-TK:* Estoy preparando el video y el audio para **${tes.title}**. Esto podría tomar unos segundos, gracias por tu paciencia.`
  }, { quoted: m });

  // Enviar el video descargado primero
  const videoDoc = {
    video: { url: videoUrl },
    mimetype: 'video/mp4',
    fileName: `${tes.title}.mp4`,
    caption: `🎥 *${tes.title}*
📽 *Fuente*: ${videoUrl}`
  };
  try {
    await conn.sendMessage(m.chat, videoDoc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El video ha sido enviado. Ahora estoy preparando el archivo de audio...');
  } catch (error) {
    console.error('Error al enviar el video:', error);
    return m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el video. Por favor, inténtalo nuevamente.');
  }

  let dataos = await downloadFromApi(0, tes.url, 'mp3');
  if (!dataos.success) {
    return m.reply(dataos.message);
  }

  let { downloadUrl } = dataos;

  const audioDoc = {
    audio: { url: downloadUrl },
    mimetype: 'audio/mp4',
    fileName: `${tes.title}.mp3`
  };
  try {
    await conn.sendMessage(m.chat, audioDoc, { quoted: m });
    m.reply('⚠️ *Admin-TK:* El archivo de audio ha sido enviado exitosamente. Si necesitas algo más, no dudes en pedírmelo.');
  } catch (error) {
    console.error('Error al enviar el audio:', error);
    m.reply('⚠️ *Admin-TK:* Hubo un error mientras intentaba enviar el archivo de audio. Por favor, inténtalo nuevamente.');
  }
};

handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.command = /^(play)$/i;

playVideoHandler.help = ['playvideo *<consulta>*'];
playVideoHandler.tags = ['downloader'];
playVideoHandler.command = /^(playvideo)$/i;

play2Handler.help = ['play2 *<consulta>*'];
play2Handler.tags = ['downloader'];
play2Handler.command = /^(play2)$/i;

export default handler;
export { playVideoHandler, play2Handler };
