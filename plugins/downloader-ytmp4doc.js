import FormData from 'form-data';
import axios from 'axios';
import cheerio from 'cheerio';

const MAX_SIZE_MB = 500; // Límite de tamaño en MB

const extractVideoID = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const parseFileSize = (sizeText) => {
  const sizeRegex = /([\d.]+)(KB|MB|GB)/i;
  const match = sizeText.match(sizeRegex);
  if (!match) return 0;
  const size = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
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

    // Filtrar videos menores al tamaño máximo permitido
    const suitableVideos = ytdata.video.filter(video => {
      const sizeMB = parseFileSize(video.fileSize);
      return sizeMB > 0 && sizeMB <= MAX_SIZE_MB;
    });

    if (suitableVideos.length === 0) {
      const videoInfo = ytdata.video.map(video => ({
        title: ytdata.title,
        fileSize: video.fileSize,
        downloadLink: video.downloadLink,
      }));
      return m.reply(
        `🔰 Admin-TK: No hay videos disponibles menores o iguales a ${MAX_SIZE_MB} MB.\n\n📋 Información de los videos encontrados:\n` +
        videoInfo
          .map(
            (info, i) =>
              `\n${i + 1}. 🎥 Título: ${info.title}\n📦 Tamaño: ${info.fileSize}\n🔗 Enlace: ${info.downloadLink}`
          )
          .join('\n')
      );
    }

    const selectedVideo = suitableVideos[0];
    await conn.sendMessage(
      m.chat,
      {
        document: { url: selectedVideo.downloadLink },
        caption: `🔰 Admin-TK: Video descargado con éxito.\n\n🎥 Título: ${ytdata.title}\n📦 Tamaño: ${selectedVideo.fileSize}`,
        mimetype: 'video/mp4',
        fileName: `${ytdata.title}.mp4`,
      },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`🔰 Admin-TK: Ocurrió un error al procesar tu solicitud.\n\n✦ Detalle del error: ${error.message || 'Error desconocido.'}`);
  }
};

handler.help = ['ytmp4 *<link>*', 'ytvdoc *<link>*'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|ytvdoc|ytmp4doc)$/i;

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
      duration: $('.res_left p').text().replace('Duracion: ', '').trim(),
      image: $('.ac img').attr('src'),
      video: [],
      audio: [],
      other: [],
    };

    $('.tab-item-data').each((index, tab) => {
      const tabTitle = $(tab).attr('id');
      $(tab).find('tbody tr').each((i, element) => {
        const fileType = $(element).find('td').eq(0).text().trim();
        const fileSize = $(element).find('td').eq(1).text().trim();
        const downloadLink = $(element).find('a.dbtn').attr('href');

        if (tabTitle === 'tab-item-1') {
          results.video.push({ fileType, fileSize, downloadLink });
        } else if (tabTitle === 'tab-item-2') {
          results.audio.push({ fileType, fileSize, downloadLink });
        } else if (tabTitle === 'tab-item-3') {
          results.other.push({ fileType, fileSize, downloadLink });
        }
      });
    });

    return results;
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, message: error.message };
  }
}
