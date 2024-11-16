import { randomBytes } from 'crypto'

let handler = async (m, { conn, text }) => {
  let groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map(v => v[0])
  let cc = text ? m : m.quoted ? await m.getQuotedObj() : false || m
  let teks = text ? text : cc.text
  conn.reply(m.chat, `_Enviando difusión a ${groups.length} grupo/s_`, m)
  for (let id of groups) await conn.copyNForward(id, conn.cMod(m.chat, cc, /bc|broadcast/i.test(teks) ? `${htki} *DIFUSIÓN* ${htka}\n` + teks : `${htki} *DIFUSIÓN* ${htka}\n` + teks + '\n' + readMore + '\n\n' + botdate), true).catch(_ => _)
  m.reply('Selesai Broadcast All Group :)')
}

handler.help = ['bcgc'].map(v => v + ' <txt>')
handler.tags = ['owner']
handler.command = /^(bcgc)$/i

handler.owner = true

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

const randomID = length => randomBytes(Math.ceil(length * .5)).toString('hex').slice(0, length)