import fetch from 'node-fetch'

var handler = async (m, { conn, text }) => {
    if (!text) throw m.reply(`*✧ Ingresa el nombre del anime que desea ver la información!*`);

    let res = await fetch('https://api.jikan.moe/v4/anime?q=' + text);

    if (!res.ok) throw m.reply('No info');

    let json = await res.json();
    let animeData = json.data[0];

    if (!animeData) throw m.reply('No info');

    let {
        title_japanese,
        url,
        type,
        score,
        members,
        status,
        synopsis,
        favorites,
        images,
        genres,
    } = animeData;

    let genreList = genres.map((genre) => genre.name).join(', ');

    let animeingfo = `
✧ *Titulo:* ${title_japanese}
✧ *Tipo:* ${type}
✧ *Genero:* ${genreList}
✧ *Puntuación:* ${score}
✧ *Miembros:* ${members}
✧ *Estado:* ${status}
✧ *Favoritos:* ${favorites}
✧ *Link:* ${url}
✧ *Synopsis:* ${synopsis}
`;

    conn.sendFile(m.chat, images.jpg.image_url, 'anjime.jpg', `*ANIME INFO*\n` + animeingfo, m);
};

handler.help = ['animeinfo <nombre>'];
handler.tags = ['anime'];
handler.command = /^(animeinfo)$/i;

handler.register = true

export default handler
