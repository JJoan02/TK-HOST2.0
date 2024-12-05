import FormData from 'form-data';
import axios from 'axios';
import cheerio from 'cheerio';

const MAX_SIZE_MB = 500; // Límite de tamaño en MB
const TIMEOUT_MS = 60000; // 60 segundos

const extractVideoID = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const parseFileSize = (sizeText) => {
  let sizeRegex = /([\d.]+)(KB|MB|GB)/i;
  let match = sizeText.match(sizeRegex);
  if (!match) return 0;
  let size = parseFloat(match[1]);
  let unit = match[2].toUpperCase();
  if (unit === 'KB') return size / 1024; // Convierte a MB
  if (unit === 'MB') return size;
  if (unit === 'GB') return size * 1024; // Convierte a MB
  return 0;
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `🔰 Admin-TK: Por favor, envía el enlace del video de YouTube junto al comando.\n\n✦ Ejemplo:\n> ${usedPrefix + command} https://youtube.com/watch?v=kGobHQ7z8X4`
    );
  }

  const videoID = extractVideoID(text);
  if (!videoID) {
    return m.reply('🔰 Admin-TK: El enlace proporcionado no es válido. Asegúrate de usar un enlace de YouTube.');
  }

  await conn.sendMessage(m.chat, { text: '🔰 Admin-TK: Procesando solicitud...' });

  try {
    const ytdata = await ytdl(text);
    if (!ytdata.success || !ytdata.video.length) {
      throw new Error('No se encontraron videos disponibles para descargar.');
    }

    const suitableVideos = ytdata.video.filter(video => {
      const sizeMB = parseFileSize(video.fileSize);
      return sizeMB > 0 && sizeMB <= MAX_SIZE_MB;
    });

    if (suitableVideos.length === 0) {
      throw new Error('No hay videos disponibles que sean menores o iguales a 500 MB.');
    }

    const selectedVideo = suitableVideos[0];
    await Promise.race([
      conn.sendMessage(
        m.chat,
        {
          document: { url: selectedVideo.downloadLink },
          caption: `🔰 Admin-TK: Video descargado con éxito.\n\n🎥 Título: ${ytdata.title}`,
          mimetype: 'video/mp4',
          fileName: `${ytdata.title}.mp4`,
        },
        { quoted: m }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('El tiempo de descarga excedió el límite establecido.')), TIMEOUT_MS)
      )
    ]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`🔰 Admin-TK: Ocurrió un error al procesar tu solicitud.\n\n✦ Detalle del error: ${error.message}`);
  }
};

handler.help = ['ytmp4 *<link>*', 'ytvdoc *<link>*'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|ytvdoc)$/i;

export default handler;

async function ytdl(query) {
  const form = new FormData();
  form.append('query', query);

  try {
    const response = await axios.post('https://yttomp4.pro/', form, {
      headers: { ...form.getHeaders() },
    });

    const $ = cheerio.load(response.data);

    const results = {
      success: true,
      title: $('.vtitle').text().trim(),
      video: [],
    };

    $('.tab-item-data tbody tr').each((i, element) => {
      const fileType = $(element).find('td').eq(0).text().trim();
      const fileSize = $(element).find('td').eq(1).text().trim();
      const downloadLink = $(element).find('a.dbtn').attr('href');
      results.video.push({ fileType, fileSize, downloadLink });
    });

    return results;
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, message: error.message };
  }
}
