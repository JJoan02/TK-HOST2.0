import { watchFile, unwatchFile } from 'fs'  
import chalk from 'chalk'  
import { fileURLToPath } from 'url'  
import moment from 'moment-timezone'  
import { group } from 'console'  
import PhoneNumber from 'awesome-phonenumber'  
import fs from 'fs'  

/*============= FECHA Y HORA =============*/  

// Obtener la hora actual en la zona horaria de Lima, Perú
let hora = moment.tz('America/Lima').format('HH')  
let minuto = moment.tz('America/Lima').format('mm')  
let segundo = moment.tz('America/Lima').format('ss')  
let horario = `${hora} H ${minuto} M ${segundo} S`  
let horario_general = `${hora}:${minuto}:${segundo}`  

// Obtener la fecha y día de la semana en español
let d = new Date(new Date + 3600000)  
let locale = 'es'  
let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]  
let week = d.toLocaleDateString(locale, { weekday: 'long' })  
let date = d.toLocaleDateString(locale, {  
  day: 'numeric',  
  month: 'long',  
  year: 'numeric'  
})  
const more = String.fromCharCode(8206)  
const readMore = more.repeat(4001)  

/*============= INFO PRINCIPAL =============*/  

// Propietarios del bot (ID, Nombre, Estado de Superusuario)
const OWNERS = [
    { id: '5493865860048', name: 'KenisawaDev', superuser: true },
    { id: '51910234457', name: 'Joan TK', superuser: true },
    // Espacios en blanco para agregar nuevos propietarios:
    { id: '', name: '', superuser: false }, // EDITAR
    { id: '', name: '', superuser: false }, // EDITAR
    { id: '', name: '', superuser: false }, // EDITAR
];

// Moderadores (ID)
const MODS = [
    // Espacios en blanco para agregar nuevos moderadores:
    '', // EDITAR
    '', // EDITAR
    '', // EDITAR
    '', // EDITAR
    '', // EDITAR
];

// Usuarios premium (ID)
const PREMS = [
    // Espacios en blanco para agregar nuevos usuarios premium:
    '', // EDITAR
    '', // EDITAR
    '', // EDITAR
    '', // EDITAR
    '', // EDITAR
];

// Información del bot
const BOT_INFO = {
    number: '51976673519', // Número del bot
    ownerNumber: '51910234457', // Número principal del propietario
};

/*============= MARCA DE AGUA =============*/  

// Configuración de la marca de agua para el bot
global.readMore = readMore  
global.author = 'Joan TK'  
global.namebot = 'Admin-TK'  
global.wm = '© Admin-TK By Joan TK'  
global.watermark = wm  
global.botdate = `⫹⫺ FECHA: ${week} ${date}\n⫹⫺ HORA: ${horario}`  
global.bottime = `H O R A : ${horario}`  
global.stickpack = `Sticker creado por ${namebot}\nhttps://dash.tk-joanhost.com/\n\nTK-BOT\n+${nomorbot}`  
global.stickauth = `© Admin-TK By Joan TK`  
global.week = `${week} ${date}`  
global.wibb = `${horario}`  

//*============= REDES =============*/  

// Enlaces a redes sociales y otras plataformas
global.sig = 'https://www.instagram.com/'  
global.sgh = 'https://github.com/MauroAzcurra'  
global.sgc = 'https://whatsapp.com/channel/0029VawpOoGHwXb6LgJkXN2R'  
global.sgw = 'https://wa.me/51910234457'  
global.sdc = '-'  
global.linkdash = 'https://dash.tk-joanhost.com/'  
global.sfb = 'https://www.facebook.com/'  
global.snh = 'https://www.instagram.com/'  
global.idcanal = '120363348355703366@newsletter'  

/*============= DISEÑOS =============*/  

// Estilos para los menús
global.dmenut = 'ଓ═┅═━–〈'  
global.dmenub = '┊↬'  
global.dmenub2 = '┊'  
global.dmenuf = '┗––––––––––✦'  
global.dashmenu = '┅═┅═❏ *DASHBOARD* ❏═┅═┅'  
global.cmenut = '❏––––––『'  
global.cmenuh = '』––––––'  
global.cmenub = '┊✦ '  
global.cmenuf = '┗━═┅═━––––––๑\n'  
global.cmenua = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     '  
global.pmenus = '✦'  
global.htki = '––––––『'  
global.htka = '』––––––'  
global.lopr = 'Ⓟ'  
global.lolm = 'Ⓛ'  
global.htjava = '⫹⫺'  
global.hsquere = ['⛶','❏','⫹⫺']  

/*============= MENSAJES FRECUENTES =============*/  

// Mensajes predeterminados para el bot
global.wait = '✧ Espere un momento...'  
global.eror = 'Error!'  

/*============= WEB API KEY =============*/  

// Definición de API y sus claves
global.APIs = {  
  // name: 'https://website'  
  xzn : 'https://skizo.tech/',  
}  

global.APIKeys = { // APIKey Here  
  // 'https://website': 'apikey'  

  'https://skizo.tech/' : 'GataDios',  
}  

/*============= OTROS =============*/  

// Tipos de archivos soportados
global.dpptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'  
global.ddocx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  
global.dxlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'  
global.dpdf = 'application/pdf'  
global.drtf = 'text/rtf'  

// Enlaces para imágenes
global.hwaifu = ['https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg']  

// Enlaces para generar texto con estilo
global.flaaa2 = [  
 "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=",  
 "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=",  
 "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=",  
 "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=",  
 "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text="  
]  
global.fla = [  
 "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=",  
 "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=",  
 "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=",  
 "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=",  
 "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text="  
]

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})


/*============= RPG GAME =============*/
global.multiplier = 69 // The higher, The harder levelup
global.rpg = {
  emoticon(string) {
    string = string.toLowerCase()
    let emot = {
      agility: '🤸‍♂️',
      arc: '🏹',
      armor: '🥼',
      bank: '🏦',
      bibitanggur: '🍇',
      bibitapel: '🍎',
      bibitjeruk: '🍊',
      bibitmangga: '🥭',
      bibitpisang: '🍌',
      bow: '🏹',
      bull: '🐃',
      cat: '🐈',
      chicken: '🐓',
      common: '📦',
      cow: '🐄',
      crystal: '🔮',
      darkcrystal: '♠️',
      diamond: '💎',
      dog: '🐕',
      dragon: '🐉',
      elephant: '🐘',
      emerald: '💚',
      exp: '✉️',
      fishingrod: '🎣',
      fox: '🦊',
      gems: '🍀',
      giraffe: '🦒',
      gold: '👑',
      health: '❤️',
      horse: '🐎',
      intelligence: '🧠',
      iron: '⛓️',
      keygold: '🔑',
      keyiron: '🗝️',
      knife: '🔪',
      legendary: '🗃️',
      level: '🧬',
      limit: '🌌',
      lion: '🦁',
      magicwand: '⚕️',
      mana: '🪄',
      money: '💵',
      mythic: '🗳️',
      pet: '🎁',
      petFood: '🍖',
      pickaxe: '⛏️',
      pointxp: '📧',
      potion: '🥤',
      rock: '🪨',
      snake: '🐍',
      stamina: '⚡',
      strength: '🦹‍♀️',
      string: '🕸️',
      superior: '💼',
      sword: '⚔️',
      tiger: '🐅',
      trash: '🗑',
      uncommon: '🎁',
      upgrader: '🧰',
      wood: '🪵'
    }
    let results = Object.keys(emot).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string))
    if (!results.length) return ''
    else return emot[results[0][0]]
  }
}
