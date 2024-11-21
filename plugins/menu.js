import moment from 'moment-timezone'
import { xpRange } from '../lib/levelling.js'
import { platform } from 'node:process'
import os from 'os'

let estilo = (text, style = 1) => {
  const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  const yStr = Object.freeze({
    1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜ𝓿𝓵𝓮1234567890'
  });
  
  const replacer = xStr.map((v, i) => ({
    original: v,
    convert: yStr[style].split('')[i]
  }));

  const str = text.toLowerCase().split('');
  return str.map(v => {
    const find = replacer.find(x => x.original === v);
    return find ? find.convert : v;
  }).join('');
};

let tags = {
    'main': '`Principal`',
    'group': '`Grupos`',
    'jadibot': '`Jadibots/Subbots`',
    'anonymous': '`Chat Anónimo`',
    'ai': '`Funciones Ai`',
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
};

let handler = async (m, { conn, usedPrefix: _p, text }) => {
  try {
    let { exp, limit, level, role } = global.db.data.users[m.sender];
    let { min, xp, max } = xpRange(level, global.multiplier);
    let name = m.sender;
    let taguser = `@${(m.sender || '').replace(/@s\.whatsapp\.net/g, '')}`;
    let names = await conn.getName(m.sender);
    let botnama = global.namebot;
    let ucapans = ucapan();
    let d = new Date(new Date + 3600000);
    let locale = 'es';
    
    // Zona horaria de Lima, Perú
    const limaTime = moment.tz('America/Lima');
    let week = limaTime.format('dddd');
    let date = limaTime.format('D MMMM YYYY');
    let dateIslamic = limaTime.format('iD iMMMM iYYYY');
    let time = limaTime.format('HH:mm:ss');

    // Cálculo de cuenta regresiva
    const targetDate = new Date('January 1, 2025 00:00:00');
    const currentDate = new Date();
    const remainingTime = targetDate.getTime() - currentDate.getTime();
    const seconds = Math.floor(remainingTime / 1000) % 60;
    const minutes = Math.floor(remainingTime / 1000 / 60) % 60;
    const hours = Math.floor(remainingTime / 1000 / 60 / 60) % 24;
    const days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
    let dateCountdown = `${days} días, ${hours} horas, ${minutes} minutos, ${seconds} segundos!`;

    let _uptime = process.uptime() * 1000;
    let _muptime;
    if (process.send) {
      process.send('uptime');
      _muptime = await new Promise(resolve => {
        process.once('message', resolve);
        setTimeout(resolve, 1000);
      }) * 1000;
    }
    let muptime = clockString(_muptime);
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
    
    // Procesando los comandos disponibles
    let help = Object.values(global.plugins).filter(plugins => !plugins.disabled).map(plugins => ({
      help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
      tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
      prefix: 'customPrefix' in plugins,
      limit: plugins.limit,
      premium: plugins.premium,
      enabled: !plugins.disabled,
    }));

    for (let plugins of help)
      if (plugins && 'tags' in plugins)
        for (let tag of plugins.tags)
          if (!(tag in tags) && tag) tags[tag] = tag;
    
    conn.menu = conn.menu || {};
    let before = conn.menu.before || defaultMenu.before;
    let header = conn.menu.header || defaultMenu.header;
    let body = conn.menu.body || defaultMenu.body;
    let footer = conn.menu.footer || defaultMenu.footer;
    let after = conn.menu.after || (conn.user.jid === global.conn.user.jid ? '' : `Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after;

    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? 'Ⓛ' : '')
                .replace(/%isPremium/g, menu.premium ? '🅟' : '')
                .trim();
            }).join('\n');
          }),
          footer
        ].join('\n');
      }),
      after
    ].join('\n');

    let replace = {
      '%': '%',
      p: _p,
      uptime,
      muptime,
      me: conn.getName(conn.user.jid),
      ucapan,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      level,
      limit,
      name,
      names,
      dateCountdown,
      platform,
      time,
      week,
      date,
      dateIslamic,
      totalreg,
      rtotalreg,
      role,
      taguser,
      readmore: readMore,
    };

    text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name]);
    
    conn.sendFile(m.chat, "./gallery/menu1.jpg", 'menu.jpg', await estilo(text), global.fliveLoc2, null);
  } catch (error) {
    console.error(error);
    throw 'Error: ' + error.message;
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu'];

export default handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

function ucapan() {
  const time = moment.tz('America/Lima').format('hh');
  let res = "¿Aún despierto?, duerme mejor. 🌙";
  
  if (time >= 4 && time < 9) {
    res = "Buena madrugada 🌄";
  } else if (time >= 9 && time < 11) {
    res = "Buenos días ☀️";
  } else if (time >= 11 && time < 18) {
    res = "Buenas tardes 🌅";
  } else {
    res = "Buenas noches 🌙";
  }
  
  return res;
}

async function getRAM() {
  const { totalmem } = await import('os');
  return Math.round(totalmem / 1024 / 1024);
	    }
