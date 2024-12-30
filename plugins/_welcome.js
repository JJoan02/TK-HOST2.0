import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import * as fs from 'fs' // Importamos fs para usar la ruta local

export async function before(m, { conn, participants, groupMetadata }) {
  // Solo actuar en eventos de grupo con stubType = 27 (alguien entra)
  if (!m.messageStubType || !m.isGroup) return true
  if (m.messageStubType !== 27) return true

  // 1) URL principal: Imagen de perfil del usuario que se une
  let ppUrl = await conn.profilePictureUrl(m.messageStubParameters[0], 'image')
    .catch(_ => 'https://qu.ax/TJkec.jpg') // si no se obtiene la PFP, se intenta la fallback remota

  let imgBuffer
  try {
    // Intentar descargar la imagen principal
    let res = await fetch(ppUrl)
    if (!res.ok) throw new Error(`Fetch status code: ${res.status}`)
    imgBuffer = await res.buffer()
  } catch (err) {
    console.error('Error descargando la imagen de perfil:', err)

    // 2) Si falla, intentamos la URL fallback remota
    try {
      let fallbackRes = await fetch('https://qu.ax/TJkec.jpg')
      if (!fallbackRes.ok) throw new Error(`Fallback status code: ${fallbackRes.status}`)
      imgBuffer = await fallbackRes.buffer()
    } catch (err2) {
      console.error('También falló la URL fallback. Uso la imagen local:', err2)
      // 3) Si también falla, como última opción usamos el archivo local
      imgBuffer = fs.readFileSync('storage/img/welcome.png')
    }
  }

  // Continuar con tu lógica de bienvenida
  let chat = global.db.data.chats[m.chat]
  if (chat?.bienvenida) {
    let welcome = `*✦━── ──━✦ \`ʙɪᴇɴᴠᴇɴɪᴅᴀ\` ✦━── ──━✦*\n\n` +
      `╭── • ✧ • ✧ • ✧ • ✧ • ✧ •\n` +
      `│ ✦ ᴡᴇʟᴄᴏᴍᴇ: @${m.messageStubParameters[0].split`@`[0]}\n` +
      `│ ✦ ɢʀᴜᴘᴏ: *${groupMetadata.subject}*\n` +
      `╰── • ✧ • ✧ • ✧ • ✧ • ✧ •\n\n` +
      `> Lee la descripción del grupo\n` +
      `> ¿Quieres comprar un servidor?`

    // Envía la bienvenida con la imagen resultante (imgBuffer)
    // (Asegúrate de usar el método que corresponda en tu bot, por ejemplo sendAi, sendMessage, etc.)
    await conn.sendAi(
      m.chat,
      titulowm2,        // Ajusta tus variables
      titu,             // Ajusta tus variables
      welcome,
      imgBuffer,
      imgBuffer,
      canal,            // Ajusta tus variables
      estilo            // Ajusta tus variables
    )
  }
}
