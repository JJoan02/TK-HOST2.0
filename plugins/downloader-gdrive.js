import { GDriveDl } from '../lib/scrape.js'

let handler = async (m, { conn, args }) => {
	if (!(args[0] || '').match(/([\w-]){33}|([\w-]){19}/)) throw m.reply('✧ Ingresa el link de *GoogleDrive*')

	const someincludes = ( data, id ) => {
        let res = data.find(el => id.includes(el) )
        return res ? true : false;
    }
	
	try {
		let res = await GDriveDl(args[0])
		if (res.fileSize.slice(-2) == "GB") return m.reply(`✧ El archivo es demasiado grande`)
		if (!someincludes(['kB','KB'], res.fileSize.slice(-2)) && parseInt(res.fileSize) > 500) return m.reply(`Tamaño: ${res.fileSize}\nSolo sw puede descarga máximo 500 MB`)
		let txt = `*[ GDRIVE Downloader ]*\n\n`
		txt += `*Nombre :* ${res.fileName}\n`
		txt += `*Tamaño :* ${res.fileSize}\n`
		txt += `*Tipo :* ${res.mimetype}`
		await m.reply(txt)
		if (!res.downloadUrl) throw eror
		await conn.sendFile(m.chat, res.downloadUrl, res.fileName + res.mimetype, res.fileName + res.mimetype, m)
	} catch (e) {
		console.log(e)
		throw m.reply('Error')
	}
}

handler.help = ['gdrive'].map(v => v + ' *<link>*')
handler.tags = ['downloader']
handler.command = /^(gdrive)$/i

handler.register = true

export default handler
