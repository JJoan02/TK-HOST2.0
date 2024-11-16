import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
 
let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) throw m.reply(`Ejemplo de uso: ${usedPrefix + command} https://web.whatsapp.com`);

const svweb = {
  recording: async (link, responseType = 1, convertOption = '--convert') => {
    try {
      const { data } = await axios.post('https://tella.mockso-cloud.com/screenshot/video', {
        url: link
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Postify/1.0.0'
        },
        responseType: 'arraybuffer'
      });
 
      const result = responseType === 1 ? Buffer.from(data) : Buffer.from(data).toString('base64');
      const domainName = new URL(link).hostname.replace('www.', '').split('.')[0];
 
      if (result.length < 1024) {
        throw new Error('El sitio web no se puede conectar.');
      }
 
      if (convertOption === '--convert') {
        const fileName = `${domainName}_video.mp4`;
        const filePath = path.join(process.cwd(), 'tmp', fileName);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, result, responseType === 1 ? null : 'base64');
        console.log(`Se guardo el video en ${filePath}`);
        await conn.sendFile(m.chat, filePath, `ssweb.mp4`, `\`✦ Pedido terminado\``, m)
        
        return { filePath, data: result };
      } 
      
      if (convertOption === '--unconvert') {
        return { type: responseType === 1 ? 'buffer' : 'base64', data: result };
      }
 
      throw new Error('❌ La opción de conversión no es válida. ');
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
};
 
let ssdata = svweb.recording(text)
}
handler.help = ['ss','ssvid'];
handler.tags = ['downloader'];
handler.command = /^(ss|ssvid)$/i;

export default handler;