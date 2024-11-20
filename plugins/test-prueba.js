import https from "https"
import { sticker } from "../lib/sticker.js"

let handler = async (m, { conn, text }) => {
    if (!text) throw `Teksnya mana?`    
    try {
        let buffer = await IBuffer(`https://api.zenkey.my.id/api/maker/brat?text=${encodeURIComponent(text)}&apikey=zenkey`)
        let stiker = await sticker(buffer, false, global.packname, global.author)        
        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'brat.webp', '', m)
        }
    } catch (e) {
        throw e
    }
}

handler.help = ["brat"]
handler.tags = ["sticker"]
handler.command = /^(bratt)$/i

export default handler

async function IBuffer(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = []
            res.on('data', chunk => data.push(chunk))
            res.on('end', () => resolve(Buffer.concat(data)))
            res.on('error', reject)
        })
    })
}