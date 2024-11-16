let handler = async (m, { conn, text, usedPrefix, command }) => {
if (db.data.chats[m.chat].nsfw == false && m.isGroup) return conn.reply(m.chat, `✧ El nsfw no esta activado, pidele a un admin que lo active escribiendo: *.on nsfw*`)
await m.react('🕓')
try {
 async function rule34Random() {
 try {
 let response = await axios.get('https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1')
 let results = response.data

 if (!Array.isArray(results) || results.length === 0) {
 throw new Error('No images found')
 }

 let randomImage = results[Math.floor(Math.random() * results.length)]
 let imageUrl = randomImage.file_url

 if (!imageUrl) {
 throw new Error('Image URL not found')
 }

 return { status: 200, imageUrl }
 } catch (error) {
 console.error('Error:', error)
 return { status: 500, error: error.message }
 }
 }

 async function sendRandomRule34Image(m) {
 try { 

 let response = await rule34Random()
 if (response.status !== 200) {
 throw new Error(response.error)
 }

 let imageUrl = response.imageUrl

 conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: "" }, { quoted: m })
 } catch (e) {
 m.reply(e.message)
 }
 }

 sendRandomRule34Image(m)
await m.react('✅')
} catch {
await m.react('✖️')
}}
handler.help = ['rule34random','hentai']
handler.tags = ['nsfw']
handler.command = ['rule34random','hentai']
handler.register = true 
handler.group = true 
export default handler