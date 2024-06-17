import fs, { promises } from 'fs'
import fetch from 'node-fetch'
let handler = async (m, { conn, usedPrefix, command }) => {
try {
let d = new Date(new Date + 3600000)
let locale = 'es'
let week = d.toLocaleDateString(locale, { weekday: 'long' })
let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
let _uptime = process.uptime() * 1000
let uptime = clockString(_uptime)
let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length 
let more = String.fromCharCode(8206)
let readMore = more.repeat(850)   
let taguser = conn.getName(m.sender)
let user = global.db.data.users[m.sender]
let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }
let menu = `*◈ ${user.registered === true ? user.name : `👉 ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'verificar nombre.edad' : 'verify name.age'}`} ◈*
*˚₊·˚₊· ͟͟͞͞➳❥ @${m.sender.split("@")[0]}*
*˚₊·˚₊· ͟͟͞͞➳❥* ${packname}${conn.user.jid == global.conn.user.jid ? '' : `\n*ੈ✩‧₊˚* 𝗧𝗞 - 𝗦𝗨𝗕 𝗕𝗢𝗧 ⇢ *@${global.conn.user.jid.split`@`[0]}*`}
*☆═━┈◈ ╰ ${vs} 𝚃𝙺 ╯ ◈┈━═☆*
*│* 
*╰ ㊂ ▸▸ _${lenguajeGB.smsMenuTotal1()}_ ◂◂*
*│* ┊
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'creador' : 'owner'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'contacto' : 'contact'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cuentastk' : 'account'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'donar' : 'donate'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'codigo' : 'sc'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'grupostk' : 'groupstk'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'instalarbot' : 'installbot'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'grupolista' : 'grouplist'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'estado' : 'status'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'velocidad' : 'ping'}_ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'infojoan' : 'infobot'}_ 
*│* ┊▸ ✦ _${lenguajeGB.lenguaje() == 'es' ? 'términos y condiciones' : 'terms'}_ 
*│* ╰∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙ 
*│*
*╰ ㊂ ▸▸ _${lenguajeGB.smsMenuTotal2()}_ ◂◂*
*│* ┊
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'serbot' : 'jadibot'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bots' : 'subsbots'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'pausarsb' : 'pausesb'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'eliminarsesion' : 'delsession'}_
*│* ╰∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙  
*│*
*╰ ㊂ ▸▸ _${lenguajeGB.smsMenuTotal6()}_ ◂◂*
*│* ┊
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'infogrupo' : 'groupinfo'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'admins' : 'dmins'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'enlace' : 'linkgroup'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'inspeccionar *enlace*' : 'inspect *link*'}_
*│* ╰∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙ 
*│*
*╰ ㊂ ▸▸ _${lenguajeGB.smsMenuTotal7()}_ ◂◂*
*│* ┊
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'notificar *texto*' : 'hidetag'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'sacar *tag*' : 'kick *tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'invitar *número*' : 'invite *number*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'daradmin *tag*' : 'promote *tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'quitaradmin *tag*' : 'demote *tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'prohibir *tag*' : 'deprive *tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desprohibir *tag*' : 'undeprive *tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'editarwelcome *texto*' : 'setwelcome'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'editarbye *texto*' : 'setbye'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cambiardesc *texto*' : 'setdesc'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cambiarnombre *texto*' : 'setname'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cambiarpp *imagen*' : 'setppgc *image*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevoenlace' : 'resetlink'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'grupo abrir' : 'group open'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'grupo cerrar' : 'group close'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'invocar' : 'tagall'}_
*│* ╰∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙ 
*│*
*╰ ㊂ ▸▸ _${lenguajeGB.smsMenuTotal10()}_ ◂◂*
*│* ┊ 
*│* ┊▸ ✦ _on_
*│* ┊▸ ✦ _off_
*│* ╰∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙
*│*
*╰ ㊂ ▸▸ _${lenguajeGB.smsMenuTotal11()}_ ◂◂*
*│* ┊ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'verificar *nombre.edad*' : 'verify *name.age*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'anulareg *id de registro*' : 'unreg *id registration*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'idregistro' : 'idregister'}_
*│* ╰∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙
*│*
*╰ ㊂ ▸▸ _${lenguajeGB.smsMenuTotal12()}_ ◂◂*
*│* ┊ 
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'respaldo' : 'backup'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'banusuario *@tag*' : 'banuser *@tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desbanusuario *@tag*' : 'unbanuser *@tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'tenerpoder' : 'autoadmin'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevabiobot *texto*' : 'setbiobot *texto*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevonombrebot *texto*' : 'setbiobot *texto*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevafotobot *imagen*' : 'setppbot *image*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'actualizar' : 'update'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'banearchat' : 'banchat'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desbanearchat' : 'unbanchat'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'salir' : 'leave'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bloquear *@tag*' : 'block *@tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desbloquear *@tag*' : 'unblock *@tag*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'obtenercodigo *nombre de archivo*' : 'getplugin *filename*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'borrardatos *número*' : 'deletedatauser *number*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'unete *enlace*' : 'join *link*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bcsubbot *texto*' : 'bcsubbot *text*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bcc *texto*' : 'bcchats *text*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bcgc *texto*' : 'broadcastgc *text*'}_
*│* ┊▸ ✦ _${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bc *texto*' : 'broadcastall *text*'}_
*│* ╰∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙
 `.trim()
    
const vi = ['https://telegra.ph/file/405daebd4bc0d69e5d165.mp4',
'https://telegra.ph/file/1d0ad9f79f65f39895b08.mp4',
'https://telegra.ph/file/c25afc1685b13210ce602.mp4']
try {
await conn.sendMessage(m.chat, { video: { url: vi.getRandom() }, gifPlayback: true, caption: menu, contextInfo: fakeChannel2 })
//await conn.sendMessage(m.chat, { video: { url: vi.getRandom() }, gifPlayback: true, caption: menu, mentions: [m.sender] }, { quoted: fkontak }) 
} catch (error) {
try {
await conn.sendMessage(m.chat, { image: { url: gataMenu.getRandom() }, gifPlayback: false, caption: menu, mentions: [m.sender, global.conn.user.jid] }, { quoted: fkontak }) 
} catch (error) {
try {
await conn.sendMessage(m.chat, { image: gataImg.getRandom(), gifPlayback: false, caption: menu, mentions: [m.sender, global.conn.user.jid] }, { quoted: fkontak }) 
} catch (error) {
try{
await conn.sendFile(m.chat, imagen5, 'menu.jpg', menu, fkontak, false, { mentions: [m.sender, global.conn.user.jid] })
} catch (error) {
return 
}}}} 
} catch (e) {
await m.reply(lenguajeGB['smsMalError3']() + '\n*' + lenguajeGB.smsMensError1() + '*\n*' + usedPrefix + `${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}` + '* ' + `${lenguajeGB.smsMensError2()} ` + usedPrefix + command)
console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
console.log(e)}}

handler.command = /^(menu|menú|memu|memú|help|info|comandos|2help|menu1.2|ayuda|commands|commandos|menucompleto|allmenu|allm|m|\?)$/i
export default handler

function clockString(ms) {
let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')}

/*await conn.sendMessage(m.chat, { video: { url: vi.getRandom() }, gifPlayback: true, caption: menu,
contextInfo: {
mentionedJid: [m.sender],
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: '120363169294281316@newsletter',
newsletterName: "GB - UPDATE ✨",
serverMessageId: -1
},
forwardingScore: 999,
externalAdReply: {
title: gt,
body: wm,
thumbnailUrl: img2,
sourceUrl: md,
mediaType: 1,
renderLargerThumbnail: false
}}})*/
