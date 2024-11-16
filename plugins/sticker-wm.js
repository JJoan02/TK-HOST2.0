import { addExif } from '../lib/sticker.js'


let handler = async (m, { conn, text }) => {
  if (!m.quoted) throw m.reply('✧ Menciona a un sticker!');
  let stiker = false
  try {
    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw m.reply('✧ Menciona a un sticker!');
    let img = await m.quoted.download()
    if (!img) throw m.reply('✧ Menciona a un sticker!');
    stiker = await addExif(img, packname || '', author || '')
  } catch (e) {
    console.error(e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, { asSticker: true })
    else throw m.reply('Error');
  }
}
handler.help = ['wm <txt>|<txt>']
handler.tags = ['sticker']
handler.command = /^wm$/i

handler.register = true
handler.premium = true

export default handler
