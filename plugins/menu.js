import moment from 'moment-timezone'
import { xpRange } from '../lib/levelling.js'
import { platform } from 'node:process'
import os from 'os'

let estilo = (text, style = 1) => {
  var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  var yStr = Object.freeze({
    1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
  });
  var replacer = [];
  xStr.map((v, i) => replacer.push({
    original: v,
    convert: yStr[style].split('')[i]
  }));
  var str = text.toLowerCase().split('');
  var output = [];
  str.map(v => {
    const find = replacer.find(x => x.original == v);
    find ? output.push(find.convert) : output.push(v);
  });
  return output.join('');
};

let tags = {
    'main': '`Principal`',
    'anonymous': '`Chat Anónimo`',
    'ai': '`Funciones Ai`',
    'jadibot': '`Jadibots/Subbots`',
    'confesar': '`Confeciones`',
    'rpg': '`Roleplay`',
    'fun': '`Divertido`',
    'search': '`Busqueda`',
    'downloader': '`Descargas`',
    'internet': '`Internet`',
    'anime': '`Anime`',
    'nsfw': '`Nsfw`',
    'sticker': '`Sticker`',
    'tools': '`Herramientas`',
    'group': '`Grupos`',
    'owner': '`Owner`',
};

const defaultMenu = {
	before: `
👋 %ucapan %names
%readmore
_*\`</${global.namebot}>\`*_
`.trimStart(),
	header: '%category',
	body: '✦ %cmd %islimit %isPremium',
	footer: '',
	after: wm,
}

let handler = async (m, { conn, usedPrefix: _p, text }) => {
	try {
		let { exp, limit, level, role } = global.db.data.users[m.sender]
		let { min, xp, max } = xpRange(level, global.multiplier)
		let name = m.sender
		let taguser = `@${(m.sender || '').replace(/@s\.whatsapp\.net/g, '')}`
		let names = await conn.getName(m.sender)
		let botnama = global.namebot
		let ucapans = ucapan()
		let d = new Date(new Date + 3600000)
		let locale = 'es'
		const dd = new Date('2023-01-01')
		const locales = 'es'
		const wib = moment.tz('Asia/Jakarta').format("HH:mm:ss")
		const wita = moment.tz('Asia/Makassar').format("HH:mm:ss")
		const wit = moment.tz('Asia/Jayapura').format("HH:mm:ss")
		let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
		let week = d.toLocaleDateString(locale, {
			weekday: 'long'
		})
		let date = d.toLocaleDateString(locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
		let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(d)

		const platform = os.platform()

		const targetDate = new Date('January 1, 2025 00:00:00')
		const currentDate = new Date()
		const remainingTime = targetDate.getTime() - currentDate.getTime()
		const seconds = Math.floor(remainingTime / 1000) % 60
		const minutes = Math.floor(remainingTime / 1000 / 60) % 60
		const hours = Math.floor(remainingTime / 1000 / 60 / 60) % 24
		const days = Math.floor(remainingTime / 1000 / 60 / 60 / 24)
		let dateCountdown = `${days} dia, ${hours} hora, ${minutes} minutl, ${seconds} segundo!`

		let time = d.toLocaleTimeString(locale, {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		})
		let _uptime = process.uptime() * 1000
		let _muptime
		if (process.send) {
			process.send('uptime')
			_muptime = await new Promise(resolve => {
				process.once('message', resolve)
				setTimeout(resolve, 1000)
			}) * 1000
		}
		let muptime = clockString(_muptime)
		let uptime = clockString(_uptime)
		let totalreg = Object.keys(global.db.data.users).length
		let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
		let help = Object.values(global.plugins).filter(plugins => !plugins.disabled).map(plugins => {
			return {
				help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
				tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
				prefix: 'customPrefix' in plugins,
				limit: plugins.limit,
				premium: plugins.premium,
				enabled: !plugins.disabled,
			}
		})

		// Extraemos los comandos por categorías
		let categoryInfo = {};

		// Recorremos las categorías en `tags`
		Object.keys(tags).forEach(tag => {
			// Filtramos los comandos que pertenecen a la categoría actual
			let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(tag))
				.map(menu => menu.help)
				.flat();  // .flat() para obtener un solo array plano

			// Guardamos la categoría y sus comandos
			categoryInfo[tags[tag]] = categoryCommands;
		});

		// categoryInfo ahora tiene todas las categorías con sus comandos.
		console.log(categoryInfo);

		conn.menu = conn.menu ? conn.menu : {}
		let before = conn.menu.before || defaultMenu.before
		let header = conn.menu.header || defaultMenu.header
		let body = conn.menu.body || defaultMenu.body
		let footer = conn.menu.footer || defaultMenu.footer
		let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after
		let _text = [
			before,
			...Object.keys(tags).map(tag => {
				return header.replace(/%category/g, tags[tag]) + '\n' + [
					...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
						return menu.help.map(help => {
							return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
								.replace(/%islimit/g, menu.limit ? 'Ⓛ' : '')
								.replace(/%isPremium/g, menu.premium ? '🅟' : '')
								.trim()
						}).join('\n')
					}),
					footer
				].join('\n')
			}),
			after
		].join('\n')
		text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
		let replace = {
			'%': '%',
			p: _p,
			uptime,
			muptime,
			me: conn.getName(conn.user.jid),
			ucapan: ucapan(),
			exp: exp - min,
			maxexp: xp,
			totalexp: exp,
			xp4levelup: max - exp,
			level,
			limit,
			name,
			names,
			weton,
			week,
			date,
			dateIslamic,
			dateCountdown,
			platform,
			wib,
			wit,
			wita,
			time,
			totalreg,
			rtotalreg,
			role,
			taguser,
			readmore: readMore
		}
		text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

		conn.sendFile(m.chat, "./gallery/menu1.jpg", 'menu.jpg', await estilo(text), global.fliveLoc2, null)
	} catch (error) {
		console.error(error)
		throw 'Error: ' + error.message
	}
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'allmenu']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function pickRandom(list) {
	return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
	let h = Math.floor(ms / 3600000)
	let m = Math.floor(ms % 3600000 / 60000)
	let s = Math.floor(ms % 60000 / 1000)
	return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

function ucapan() {
	let time = new Date().getHours()
	if (time >= 4 && time < 10) {
		return 'Selamat Pagi'
	} else if (time >= 10 && time < 15) {
		return 'Selamat Siang'
	} else if (time >= 15 && time < 18) {
		return 'Selamat Sore'
	} else {
		return 'Selamat Malam'
	}
}
