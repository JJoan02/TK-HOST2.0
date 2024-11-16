import fs from 'fs'
import fetch from 'node-fetch'
import moment from 'moment-timezone'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.ownreply = conn.ownreply ? conn.ownreply : {}
    if (!text) throw m.reply(`*✧ Ejemplo:*\n\n${usedPrefix + command} numero|mensaje\n\n*✧ Uso:* ${usedPrefix + command} ${m.sender.split`@`[0]}|Hola.`);
    let [jid, pesan] = text.split('|');
    if ((!jid || !pesan)) throw m.reply(`*✧ Ejemplo:*\n\n${usedPrefix + command} numero|mensaje\n\n*✧ Uso:* ${usedPrefix + command} ${m.sender.split`@`[0]}|Hola.`);
    jid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let data = (await conn.onWhatsApp(jid))[0] || {};
    if (!data.exists) throw m.reply('✧ El numero no está registrado en whatsapp.');
    
   // if (jid == m.sender) throw 'tidak bisa mengirim pesan memfess ke diri sendiri.'
    
    let mf = Object.values(conn.ownreply).find(mf => mf.status === true)
    if (mf) return !0
    try {
    	let id = + new Date
        let txt = `Hola @${data.jid.split('@')[0]}, Recibiste un mensaje de: *Owner*\nMensaje: \n${pesan}`.trim();
        conn.relayMessage(data.jid, {
            extendedTextMessage:{
            text: txt, 
            contextInfo: {
            mentionedJid: [data.jid],
                 externalAdReply: {
                    title: 'SYSTEM',
                    mediaType: 1,
                    previewType: 0,
                    //renderLargerThumbnail: true,
                    //thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIyz1dMPkZuNleUyfXPMsltHwKKdVddTf4-A&usqp=CAU',
                    sourceUrl: ''
                }
            }
      }}, {}).then(() => {
            m.reply('✧ Mensaje enviado con éxito.')
            conn.ownreply[id] = {
                id,
                dari: m.sender,
                penerima: data.jid,
                pesan: pesan,
                status: false
            }
            return !0
        })
    } catch (e) {
        console.log(e)
        return m.reply('Error');
    }
}
handler.help = ['reply'].map(v => v + ' <numero|mensaje>')
handler.tags = ['owner']
handler.command = /^(mensaje|reply)/i

handler.owner = true

handler.fail = null

export default handler
