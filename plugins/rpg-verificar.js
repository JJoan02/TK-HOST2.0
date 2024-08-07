import { createHash } from 'crypto'
let nombre = 0, edad = 0, genero = 0, bio = 0, identidad = 0, pasatiempo = 0, registro, _registro, fecha, hora, tiempo, registrando
let pas1 = 0, pas2 = 0, pas3 = 0, pas4 = 0, pas5 = 0  

let handler = async function (m, { conn, text, command, usedPrefix }) {
    let key 
    let sinDefinir = '😿 No encontrada'
    let d = new Date(new Date + 3600000)
    let locale = 'es'
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    let time = d.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    }) 
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let pp = await conn.profilePictureUrl(who, 'image').catch((_) => gataMenu)
    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }
    let nombreWA = await usedPrefix + conn.getName(m.sender)
    let user = global.db.data.users[m.sender]
    let verificar = new RegExp(usedPrefix)
    let biografia = await conn.fetchStatus(m.sender).catch(_ => 'undefined')
    bio = biografia.status?.toString() || sinDefinir
    
    if (user.registered === true) return // Si ya está registrado, no hacer nada y retornar

    if (command == 'reg') {
        let args = text.split(' ')
        let nombre = args[0] || nombreWA
        let edad = parseInt(args[1]) || 18

        if (!nombre || nombre.length < 3 || nombre.length > 25) return // Si el nombre no es válido, no hacer nada y retornar
        if (isNaN(edad) || edad < 10 || edad > 90) return // Si la edad no es válida, no hacer nada y retornar

        user.name = nombre
        user.age = edad
        user.registered = true

        let registroRapido = ` *░ 📑 REGISTRO COMPLETO 📑 ░*
 *∷∷∷∷∷∷∷∷∷∷∷∷∷∷∷*
┊ *✓ NOMBRE*
┊ ⁘ ${user.name}
┊
┊ *✓ EDAD*
┊ ⁘ ${user.age} años
╰┈┈┈┈┈┈┈┈┈┈┈┈•

❇️ \`\`\`Registro completado exitosamente.\`\`\`

*Usa el comando .menu para acceder al Bot Admin-TK*`
        
        await conn.sendMessage(m.chat, {
            text: registroRapido,
            contextInfo: {
                externalAdReply: {
                    title: wm,
                    body: '🌟 Registro rápido completado',
                    thumbnailUrl: pp, 
                    sourceUrl: 'https://atom.bio/joan_tk02',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
    }
}

export default handler

