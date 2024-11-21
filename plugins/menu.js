

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
}
const defaultMenu = {
	before: `
> 👋 %ucapan %names
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
		for (let plugins of help)
			if (plugins && 'tags' in plugins)
				for (let tag of plugins.tags)
					if (!(tag in tags) && tag) tags[tag] = tag
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

  const infoReply = {
  contextInfo: {
    externalAdReply: {
      body: TK-HOST, // Aquí puedes agregar un texto que se mostrará en el mensaje
      mediaType: 1,
      mediaUrl: 'https://dash.tk-joanhost.com/home', // Reemplaza con tu enlace
      previewType: 0,
      renderLargerThumbnail: true,
      sourceUrl: 'https://dash.tk-joanhost.com/home', // Puedes usar el mismo enlace aquí si lo deseas
      thumbnail: 'https://pomf2.lain.la/f/80qkdym1.jpg', // La miniatura
      title: global.namebot // El título del mensaje
    }
  }
};

// Envía el mensaje con la respuesta modificada
await conn.reply(m.chat, await estilo(text), m, infoReply);
		//await conn.sendFile(m.chat, "https://i.pximg.net/c/600x1200_90_webp/img-master/img/2023/12/31/09/20/33/114715550_p0_master1200.jpg", `menu.jpg`, await estilo(text), m, null, rcanal)
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
	let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
	let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
	let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
	return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

function ucapan() {
    const time = moment.tz('America/Lima').format('HH')  // Ajustado a Lima, Perú (UTC-5)
    let res = "¿Aún despiertx?, Duerme mejor. 🌙";
    
    if (time >= 0 && time < 1) {
        res = "¡Es de noche, cuídate mucho y descansa! 🌙";
    } else if (time >= 1 && time < 2) {
        res = "Aún es temprano, ¿por qué no sigues descansando? 🌛";
    } else if (time >= 2 && time < 3) {
        res = "Buenas noches, que tengas dulces sueños 🌌";
    } else if (time >= 3 && time < 4) {
        res = "La madrugada está quieta, que descanses bien 🌙";
    } else if (time >= 4 && time < 5) {
        res = "Es hora de descansar más, que tengas una buena noche 🌠";
    } else if (time >= 5 && time < 6) {
        res = "¡Buenos días! Es temprano, pero el día comienza 🌄";
    } else if (time >= 6 && time < 7) {
        res = "¡Buenos días! Que el día te traiga nuevas energías ☀️";
    } else if (time >= 7 && time < 8) {
        res = "¡Es hora de comenzar el día! ¡A darle con todo! 🌅";
    } else if (time >= 8 && time < 9) {
        res = "¡Ya casi es hora de hacer cosas productivas! ¡Ánimo! ☀️";
    } else if (time >= 9 && time < 10) {
        res = "¡Buen día! ¿Listo para aprovechar la mañana? 🌞";
    } else if (time >= 10 && time < 11) {
        res = "¡Buenos días! Es una excelente hora para avanzar en tus tareas 💼";
    } else if (time >= 11 && time < 12) {
        res = "¡Buenas! Aprovecha esta hora para dar lo mejor de ti 💪";
    } else if (time >= 12 && time < 13) {
        res = "¡Buenas tardes! Ya casi es hora de comer 🍽️";
    } else if (time >= 13 && time < 14) {
        res = "¡Qué tarde tan linda! Disfruta de tu jornada 🕒";
    } else if (time >= 14 && time < 15) {
        res = "¡Qué buena hora para descansar un poco y recargar energías! 🌤️";
    } else if (time >= 15 && time < 16) {
        res = "¡Buenas tardes! No olvides hacer una pausa en tu día 🧘‍♂️";
    } else if (time >= 16 && time < 17) {
        res = "¡Hola! Ya estamos cerca del final del día, pero aún hay tiempo para lograr más 🔥";
    } else if (time >= 17 && time < 18) {
        res = "¡Buenas tardes! Es una buena hora para reflexionar sobre lo logrado 💭";
    } else if (time >= 18 && time < 19) {
        res = "¡Ya es casi noche! ¿Listo para relajarte un poco? 🌆";
    } else if (time >= 19 && time < 20) {
        res = "¡Buenas noches! Es el momento de descansar y desconectar 🛏️";
    } else if (time >= 20 && time < 21) {
        res = "¡Buenas noches! Prepárate para un descanso reparador 🌙";
    } else if (time >= 21 && time < 22) {
        res = "¡Buenas noches! Ya es hora de dormir, recarga energías para mañana 💤";
    } else if (time >= 22 && time < 23) {
        res = "¡Buenas noches! Relájate, el día terminó. 🌚";
    } else {
        res = "¡Es muy tarde, ya es hora de descansar! 🛌";
    }
    
    return res;
}

async function getRAM() {
	const {
		totalmem
	} = await import('os')
	return Math.round(totalmem / 1024 / 1024)
			}
