// CÓDIGO ADAPTADO POR https://github.com/GataNina-Li | @gata_dios

// Este código maneja un comando en un bot de WhatsApp que detecta y gestiona enlaces no deseados de varias plataformas como TikTok, YouTube, Telegram, Facebook, Instagram y Twitter en grupos. Dependiendo de la cantidad de advertencias recibidas, el bot puede eliminar el mensaje y expulsar al usuario del grupo.

// Importar la función fetch de node-fetch
import fetch from 'node-fetch'

// Expresiones regulares para detectar enlaces de varias plataformas
const isLinkTik = /tiktok.com/i
const isLinkYt = /youtube.com|youtu.be/i
const isLinkTel = /telegram.com|t.me/i
const isLinkFb = /facebook.com|fb.me/i
const isLinkIg = /instagram.com/i
const isLinkTw = /twitter.com/i

// Mensajes de advertencia para cada plataforma
const warnings = {
    tiktok: [
        "🚫 ¡Alto ahí! Los enlaces de TikTok están prohibidos, pero te dejo pasar esta vez. 🎟️",
        "⚠️ Otra vez con TikTok... No es la mejor idea, ¿verdad? 🤨",
        "🛑 Tres veces y fuera: TikTok aquí no es bienvenido. Adiós. 👋"
    ],
    youtube: [
        "🚫 ¡Hey! Los enlaces de YouTube están prohibidos. Primera advertencia. 📺",
        "⚠️ Segundo aviso: YouTube no es bienvenido aquí. 🎬",
        "🛑 Tres strikes y estás fuera: YouTube no es permitido. Adiós. 👋"
    ],
    telegram: [
        "🚫 ¡Detente! Los enlaces de Telegram no están permitidos. Considera esto una advertencia. ✉️",
        "⚠️ Otra vez con Telegram... No es bienvenido aquí. 📲",
        "🛑 Tres strikes y estás fuera: Telegram no es permitido. Adiós. 👋"
    ],
    facebook: [
        "🚫 ¡Ojo! Los enlaces de Facebook están prohibidos. Esta es tu primera advertencia. 📘",
        "⚠️ Segundo aviso: Facebook no es permitido aquí. 👥",
        "🛑 Tres veces y fuera: Facebook no es permitido. Adiós. 👋"
    ],
    instagram: [
        "🚫 ¡Alto! Los enlaces de Instagram están prohibidos. Primera advertencia. 📸",
        "⚠️ Otro enlace de Instagram... No es bienvenido aquí. 📷",
        "🛑 Tres strikes y estás fuera: Instagram no es permitido. Adiós. 👋"
    ],
    twitter: [
        "🚫 ¡Hey! Los enlaces de Twitter no están permitidos. Primera advertencia. 🐦",
        "⚠️ Segundo aviso: Twitter no es bienvenido aquí. 🐤",
        "🛑 Tres strikes y estás fuera: Twitter no es permitido. Adiós. 👋"
    ]
}

// Función principal para manejar el mensaje antes de procesarlo
export async function before(m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) {
    // Verifica si el mensaje proviene del bot o si no es un grupo
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false

    // Obtener datos del chat y del bot
    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[this.user.jid] || {}
    let delet = m.key.participant
    let bang = m.key.id
    let toUser = `${m.sender.split("@")[0]}`
    let aa = toUser + '@s.whatsapp.net'
    let warningLevel = chat.warningLevel || 0

    // Verificar si el mensaje contiene enlaces de diferentes plataformas
    const isAntiLinkTik = isLinkTik.exec(m.text)
    const isAntiLinkYt = isLinkYt.exec(m.text)
    const isAntiLinkTel = isLinkTel.exec(m.text)
    const isAntiLinkFb = isLinkFb.exec(m.text)
    const isAntiLinkIg = isLinkIg.exec(m.text)
    const isAntiLinkTw = isLinkTw.exec(m.text)

    // Función para verificar enlaces y enviar advertencias
    const checkAndWarn = async (platform, isLink, warningMessages) => {
        if (isLink) {
            if (warningLevel < 2) {
                // Enviar advertencia y eliminar el mensaje
                await conn.reply(m.chat, warningMessages[warningLevel], null, { mentions: [aa] })
                await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
                chat.warningLevel = (warningLevel + 1) % 3
            } else {
                // Expulsar al usuario después de la tercera advertencia
                await conn.reply(m.chat, warningMessages[2], null, { mentions: [aa] })
                await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                chat.warningLevel = 0
            }
        }
    }

    // Verificar enlaces según la configuración del chat
    if (chat.antiTiktok) await checkAndWarn('tiktok', isAntiLinkTik, warnings.tiktok)
    if (chat.antiYoutube) await checkAndWarn('youtube', isAntiLinkYt, warnings.youtube)
    if (chat.antiTelegram) await checkAndWarn('telegram', isAntiLinkTel, warnings.telegram)
    if (chat.antiFacebook) await checkAndWarn('facebook', isAntiLinkFb, warnings.facebook)
    if (chat.antiInstagram) await checkAndWarn('instagram', isAntiLinkIg, warnings.instagram)
    if (chat.antiTwitter) await checkAndWarn('twitter', isAntiLinkTw, warnings.twitter)

    return true
}
