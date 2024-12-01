import fetch from "node-fetch";

let handler = async (m, { conn, command, args }) => {
  const query = args.length ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || "";
  if (!query || !query.trim()) {
    await conn.sendMessage(m.chat, {
      text: `⚠️ Ingresa una consulta para buscar.\n\n*Ejemplo:* .${command} rosa pastel belanova`,
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
    return;
  }

  try {
    // Mensaje inicial de búsqueda
    let statusMessage = await conn.sendMessage(m.chat, { text: '🔎 Buscando música en Spotify...' }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // Búsqueda en Spotify
    const searchResponse = await fetch(`https://rest.cifumo.biz.id/api/downloader/spotify-search?q=${encodeURIComponent(query)}`);
    const searchResults = await searchResponse.json();
    if (!searchResults?.data?.length) {
      await conn.sendMessage(m.chat, {
        text: '⚠️ No se encontraron resultados. Intenta con otra búsqueda.',
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return;
    }

    // Descargar audio
    const songData = searchResults.data[0];
    const downloadResponse = await fetch(`https://rest.cifumo.biz.id/api/downloader/spotify-dl?url=${songData.url}`);
    const downloadData = await downloadResponse.json();
    const { title, type, artis, download, image } = downloadData?.data || {};
    if (!download) {
      await conn.sendMessage(m.chat, {
        text: '⚠️ No se pudo descargar el audio. Por favor inténtalo nuevamente.',
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return;
    }

    // Actualizar mensaje con información del audio
    const songInfo = `🔰 *Admin-TK Spotify Downloader*\n\n🎵 *Título:* ${title}\n🎤 *Artista:* ${artis}\n📀 *Tipo:* ${type}\n🔗 *Enlace:* ${songData.url}`;
    await conn.sendMessage(m.chat, {
      text: `${songInfo}\n\n⬇️ Descargando audio...`,
      edit: statusMessage.key,
    });

    // Descargar y enviar audio
    const thumbnailBuffer = await fetch(image).then(res => res.buffer());
    await conn.sendMessage(m.chat, {
      audio: { url: download },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: songData.url,
          title: title,
          sourceUrl: songData.url,
          thumbnail: thumbnailBuffer,
        },
      },
    }, { quoted: m });

    // Mensaje final de éxito
    await conn.sendMessage(m.chat, {
      text: `${songInfo}\n\n✅ Audio descargado con éxito.`,
      edit: statusMessage.key,
    });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, {
      text: '⚠️ Ocurrió un error inesperado. Por favor inténtalo nuevamente más tarde.',
    }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ["splay *<consulta>*"];
handler.tags = ["downloader"];
handler.command = /^(spotifyplay|splay)$/i;

export default handler;
