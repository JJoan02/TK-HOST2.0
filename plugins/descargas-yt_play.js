import axios from 'axios';
export default async function handler(conn, { m, command, text, usedPrefix }) {
   if (!text) {
    await conn.sendMessage(m.chat, { text: 'Ingresa un texto para poder descargarlo, ejemplo: ' + usedPrefix + command + ' Aventura Ozuna' }, { quoted: m });
    return;
   }
   m.react('⏳');
   try {
    let api = `https://deliriusapi-official.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`;
    let response = await axios.get(api);
    let data = response.data;
    if (data.status) {
     let vid = data.data[Math.floor(Math.random() * data.data.length)];
     if (vid.videoUrl) {
     let txt = `
- *Descargando :* ${vid.title}

> *Publicado :* ${vid.publishedAt}
> *Duración :* ${vid.duration}
> *Vistas :* ${vid.views?.toLocaleString('de-DE') || 0}
> *Canal :* ${vid.author?.name || undefined}
> *Enlace :* ${vid.url}`.trim();
     await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: txt, mentions: [m.sender] }, { quoted: m });
     let api2 = `https://deliriusapi-official.vercel.app/download/ytmp4?url=${vid.videoUrl}`;
     let resp = await axios.get(api2);
     let dat = resp.data;
     let url = dat.download.url || undefined;
     if (dat && dat.status && url) {
     let res = await axios.get(url, { responseType: 'arraybuffer' });
     switch (command) {
      case 'play':
       await conn.sendMessage(m.chat, { audio: res, mimetype: 'audio/mpeg', ptt: false, mentions: [m.sender] }, { quoted: m });
       m.react('✅');
       break;
      case 'play2':
       await conn.sendMessage(m.chat, { video: res, mimetype: 'video/mp4', caption: '', mentions: [m.sender] }, { quoted: m });
       m.react('✅');
       break;
     }
    } else {
        await conn.sendMessage(m.chat, { text: 'No se pudo descargar el archivo, intentelo de nuevo.' }, { quoted: m });
        m.react('❎');
    }
    } else {
        await conn.sendMessage(m.chat, { text: 'Ocurrió un error,  inténtalo de nuevo' }, { quoted: m });
        m.react('❎');
    }
    } else {
        await conn.sendMessage(m.chat, { text: `No hubo resultados para ${text}` }, { quoted: m });
        m.react('❎');
    }
   } catch (e) {
    console.error(e);
    m.reply(e.toString());
 }
}
handler.command = ['play', 'play2'];
