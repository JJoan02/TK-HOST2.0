import { createHash } from 'crypto'
const { proto, generateWAMessageFromContent } = (await import('@adiwajshing/baileys')).default;

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix }) {
  let sn = createHash('md5').update(m.sender).digest('hex')

//m.reply(`${sn}`)
/*    let textcaption = "`N U M E R O - S E R I A L`"
    let txtbutton = "Copiar Numero De Serie"
    let txtcopy = sn
        let buttonMessage = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: { text: textcaption },
                    nativeFlowMessage: {
                        buttons: [{
                "name": "cta_copy",
                "buttonParamsJson": JSON.stringify({
                "display_text": `${txtbutton}`,
                "copy_code": `${txtcopy}`
                })
              },],
                    }
                })
            }
        }
    }, { quoted: global.ftoko });

    await conn.relayMessage(m.chat, buttonMessage.message, {});*/
}

handler.help = ['versn']
handler.tags = ['xp']
handler.command = /^(versn)$/i
handler.register = true
export default handler