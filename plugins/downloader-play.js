import yts from 'yt-search';
import fs from 'fs';
import os from 'os';
import axios from 'axios';

const handler = async (m, { conn, command, text, usedPrefix }) => {
  try {
    // Validación inicial
    if (!text) throw `Usa ejemplo: ${usedPrefix}${command} Joji - Ew`;

    // Búsqueda en YouTube
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) throw 'No se encontró el video, intenta con otro título.';

    const { title, thumbnail, timestamp, views, ago, url } = vid;

    // Notificación de inicio
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    // Descarga del archivo MP4
    const videoResponse = await axios.get(
      `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`
    );
    const videoDownloadUrl = videoResponse.data.url;

    if (!videoDownloadUrl) throw 'No se pudo obtener el archivo MP4.';

    const tmpDir = os.tmpdir();
    const mp4Path = `${tmpDir}/${title}.mp4`;

    const videoStream = await axios({
      method: 'get',
      url: videoDownloadUrl,
      responseType: 'stream',
    });

    const mp4Stream = fs.createWriteStream(mp4Path);
    videoStream.data.pipe(mp4Stream);

    mp4Stream.on('finish', async () => {
      console.log(`✅ Video descargado: ${mp4Path}`);

      // Enviar archivo MP4
      await conn.sendMessage(m.chat, {
        video: { url: mp4Path },
        caption: `🎥 **Título:** ${title}\n⏳ **Duración:** ${timestamp}\n👁️ **Vistas:** ${views}\n🗓️ **Publicado:** ${ago}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaUrl: url,
            title: title,
            body: 'Descarga de Video',
            thumbnail: await (await conn.getFile(thumbnail)).data,
          },
        },
      }, { quoted: m });

      // Descarga del archivo MP3
      const audioResponse = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`
      );
      const audioDownloadUrl = audioResponse.data.url;

      if (!audioDownloadUrl) throw 'No se pudo obtener el archivo MP3.';

      const mp3Path = `${tmpDir}/${title}.mp3`;

      const audioStream = await axios({
        method: 'get',
        url: audioDownloadUrl,
        responseType: 'stream',
      });

      const mp3Stream = fs.createWriteStream(mp3Path);
      audioStream.data.pipe(mp3Stream);

      mp3Stream.on('finish', async () => {
        console.log(`✅ Audio descargado: ${mp3Path}`);

        // Enviar archivo MP3
        await conn.sendMessage(m.chat, {
          audio: { url: mp3Path },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          caption: `🎵 **Título:** ${title}\n🗓️ **Publicado:** ${ago}\n\n*🔰 Servicio proporcionado por Admin-TK*`,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              mediaUrl: url,
              title: title,
              body: 'Descarga de Audio',
              thumbnail: await (await conn.getFile(thumbnail)).data,
            },
          },
        }, { quoted: m });

        // Eliminar archivos temporales
        fs.unlink(mp4Path, (err) => {
          if (err) console.error(`❌ Error eliminando archivo MP4: ${err}`);
          else console.log(`🗑️ Archivo MP4 eliminado: ${mp4Path}`);
        });

        fs.unlink(mp3Path, (err) => {
          if (err) console.error(`❌ Error eliminando archivo MP3: ${err}`);
          else console.log(`🗑️ Archivo MP3 eliminado: ${mp3Path}`);
        });

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      });

      mp3Stream.on('error', (err) => {
        console.error(`❌ Error escribiendo archivo MP3: ${err}`);
        throw 'Error al descargar el audio MP3.';
      });
    });

    mp4Stream.on('error', (err) => {
      console.error(`❌ Error escribiendo archivo MP4: ${err}`);
      throw 'Error al descargar el video MP4.';
    });
  } catch (error) {
    console.error('❌ Error general:', error.message);
    m.reply(`❌ Error: ${error.message}. Verifica el enlace o intenta nuevamente.\n\n*🔰 Servicio proporcionado por Admin-TK*`);
  }
};

handler.help = ['play'].map((v) => v + ' *<consulta>*');
handler.tags = ['downloader'];
handler.command = /^(play)$/i;

handler.register = true;
handler.disable = false;

export default handler;
