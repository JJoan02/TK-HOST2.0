import moment from 'moment-timezone'
import PhoneNum from 'awesome-phonenumber'

let regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

let handler = async (m, { conn, text, usedPrefix, command: cmd }) => {
	let num = m.quoted?.sender || m.mentionedJid?.[0] || text
	if (!num) throw m.reply(`*✧ Ejemplo:* ${usedPrefix + cmd} @tag / 549xxx`)
	num = num.replace(/\D/g, '') + '@s.whatsapp.net'
	if (!(await conn.onWhatsApp(num))[0]?.exists) throw m.reply('✧ El usuario no existe.')
	let img = await conn.profilePictureUrl(num, 'image').catch(_ => './src/avatar_contact.png')
	let bio = await conn.fetchStatus(num).catch(_ => { })
	let name = await conn.getName(num)
	let business = await conn.getBusinessProfile(num)
	let format = PhoneNum(`+${num.split('@')[0]}`)
	let country = regionNames.of(format.getRegionCode('international'))
	let wea = `\t\t\t\t*▾ WHATSAPP ▾*\n\n*° País :* ${country.toUpperCase()}\n*° Nombre :* ${name ? name : '-'}\n*° Formato :* ${format.getNumber('international')}\n*° Link :* wa.me/${num.split('@')[0]}\n*° Tag :* @${num.split('@')[0]}\n*° Info :* ${bio?.status || '-'}\n*° Actualizado el :* ${bio?.setAt ? moment(bio.setAt.toDateString()).locale('id').format('LL') : '-'}\n\n${business ? `\t\t\t\t*▾ INFO BUSINESS ▾*\n\n*° BusinessId :* ${business.wid}\n*° Sitio web :* ${business.website ? business.website : '-'}\n*° Email :* ${business.email ? business.email : '-'}\n*° Categoría :* ${business.category}\n*° Dirección :* ${business.address ? business.address : '-'}\n*° Horario :* ${business.business_hours.timezone ? business.business_hours.timezone : '-'}\n*° Descripción* : ${business.description ? business.description : '-'}` : '*Standard WhatsApp Account*'}`
	img ? await conn.sendMessage(m.chat, { image: { url: img }, caption: wea, mentions: [num] }, { quoted: m }) : m.reply(wea)
}

handler.help = ['wastalk']
handler.tags = ['tools']
handler.command = /^(wa|whatsapp)stalk$/i

handler.register = true

export default handler