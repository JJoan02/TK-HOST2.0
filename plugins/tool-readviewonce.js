var handler = async (m, { conn }) => {
    if (!/viewOnce/.test(m.quoted?.mtype)) throw m.reply('✧ Responde a una Imagen o Video que se pueda ver una vez.');
    let mtype = Object.keys(m.quoted.message)[0]
    let buffer = await m.quoted.download()
    let caption = m.quoted.message[mtype].caption || ''
    
    // Memeriksa apakah kata kunci "admin" ada dalam teks pesan
    if (caption.toLowerCase().includes('×')) {
        throw m.reply('Error');
    }
    
    conn.sendMessage(m.chat, { [mtype.replace(/Message/, '')]: buffer, caption }, { quoted: m })
}

handler.help = ['ver']
handler.tags = ['tools']
handler.command = /^ver/i

handler.register = true

export default handler
