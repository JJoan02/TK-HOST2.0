import axios from 'axios';
import m3u8 from 'm3u8-parser';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Función principal para manejar descargas
const downloadAppleMusic = async (url) => {
  try {
    const response = await axios.get(`https://music.apple.com/us/api?url=${url}`);
    const data = response.data;

    if (!data.streams || data.streams.length === 0) {
      throw new Error('No se encontraron streams para descargar.');
    }

    const stream = data.streams[0]; // Usamos el primer stream disponible
    const playlistUrl = stream.uri;

    const parser = new m3u8.Parser();
    const playlist = await axios.get(playlistUrl);
    parser.push(playlist.data);
    parser.end();

    const segments = parser.manifest.segments.map((segment) => segment.uri);

    const fileName = `${data.id}.mp4`;
    const filePath = path.resolve(__dirname, 'downloads', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    for (const segment of segments) {
      const segmentData = await axios.get(segment, { responseType: 'arraybuffer' });
      fs.appendFileSync(filePath, segmentData.data);
    }

    console.log(`✅ Descarga completa: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`❌ Error durante la descarga: ${error.message}`);
    throw error;
  }
};

// Handler principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `❌ Uso correcto: ${usedPrefix + command} <link de Apple Music>`;
  }

  try {
    conn.sendMessage(m.chat, { react: { text: '⏬', key: m.key } });

    const downloadedFile = await downloadAppleMusic(text);

    await conn.sendMessage(m.chat, {
      document: { url: downloadedFile },
      fileName: path.basename(downloadedFile),
      mimetype: 'audio/mp4',
      quoted: m,
    });

    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    m.reply(`❌ Error al descargar: ${error.message}`);
  }
};

handler.help = ['applemusic <link>'];
handler.tags = ['downloader'];
handler.command = /^(applemusic)$/i;

export default handler;
