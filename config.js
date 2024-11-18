import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';

/*============= CONFIGURACIÓN =============*/
const TIMEZONE = 'America/Lima'; // Zona horaria
const LOCALE = 'es';            // Idioma de salida

/*============= FUNCIONES =============*/
// Obtiene la hora formateada (HH:mm:ss)
const getCurrentTime = () => {
    const now = moment.tz(TIMEZONE);
    return {
        hour: now.format('HH'),
        minute: now.format('mm'),
        second: now.format('ss'),
        full: now.format('HH:mm:ss'),
    };
};

// Obtiene la fecha formateada (día, mes, año)
const getCurrentDate = () => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
    const weekday = now.toLocaleDateString(LOCALE, { weekday: 'long' });
    const date = now.toLocaleDateString(LOCALE, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return {
        weekday,
        full: date,
    };
};

// Calcula el "weton" basado en días
const getWeton = () => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
    const wetonList = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'];
    return wetonList[Math.floor(now / 84600000) % 5];
};

// Genera un separador largo para mensajes
const generateReadMore = (length = 4001) => String.fromCharCode(8206).repeat(length);

/*============= EJECUCIÓN =============*/
const time = getCurrentTime();
const date = getCurrentDate();
const weton = getWeton();
const readMore = generateReadMore();

// Impresión en consola
console.log(chalk.green(`Horario: ${time.full} (${time.hour} H ${time.minute} M ${time.second} S)`));
console.log(chalk.blue(`Fecha: ${date.full} (${date.weekday})`));
console.log(chalk.magenta(`Weton: ${weton}`));
console.log(chalk.yellow(`ReadMore generado: ${readMore.length} caracteres`));

/*============= CONFIGURACIÓN GLOBAL =============*/

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
    number: '5493816785382', // Número del bot
    ownerNumber: '51910234457', // Número principal del propietario
};

/*============= ASIGNACIÓN GLOBAL =============*/
global.owner = OWNERS.map(owner => [owner.id, owner.name, owner.superuser]);
global.mods = MODS.filter(mod => mod); // Ignorar espacios en blanco
global.prems = PREMS.filter(prem => prem); // Ignorar espacios en blanco
global.nomorbot = BOT_INFO.number;
global.nomorown = BOT_INFO.ownerNumber;

/*============= FUNCIONES ÚTILES =============*/

// Imprimir información estructurada
const printGlobalInfo = () => {
    console.log('=== Información del Bot ===');
    console.log('Propietarios:');
    OWNERS.forEach(owner => {
        if (owner.id) {
            console.log(`- ${owner.name} (${owner.id}) [Superusuario: ${owner.superuser}]`);
        }
    });
    console.log('Moderadores:');
    MODS.forEach(mod => {
        if (mod) console.log(`- ${mod}`);
    });
    console.log('Usuarios Premium:');
    PREMS.forEach(prem => {
        if (prem) console.log(`- ${prem}`);
    });
    console.log(`Número del Bot: ${BOT_INFO.number}`);
    console.log(`Número del Propietario Principal: ${BOT_INFO.ownerNumber}`);
};

// Ejecutar la impresión para verificar
printGlobalInfo();

/*============= CONFIGURACIÓN GLOBAL =============*/

// Marca de agua e información del bot
global.BOT_INFO = {
    author: 'Joan TK', // Autor del bot
    name: 'Admin-TK', // Nombre del bot
    watermark: '© Admin-TK By Joan TK', // Marca de agua principal
    date: `⫹⫺ FECHA: ${week} ${date}\n⫹⫺ HORA: ${horario}`, // Fecha y hora
    time: `H O R A : ${horario}`, // Hora específica
    stickerPack: `Sticker creado por Admin-TK\nhttps://dash.tk-joanhost.com/\n\nTK-BOT\n+${nomorbot}`, // Información del paquete de stickers
    stickerAuthor: '© Admin-TK By Joan TK', // Autor del sticker
    weekInfo: `${week} ${date}`, // Información de la semana
    shortTime: `${horario}`, // Hora en formato reducido
    // Espacios en blanco para agregar nuevos datos:
    additionalInfo1: '', // EDITAR
    additionalInfo2: '', // EDITAR
};

// Referencias globales individuale:
global.author = global.BOT_INFO.author;
global.namebot = global.BOT_INFO.name;
global.watermark = global.BOT_INFO.watermark;
global.botdate = global.BOT_INFO.date;
global.bottime = global.BOT_INFO.time;
global.stickpack = global.BOT_INFO.stickerPack;
global.stickauth = global.BOT_INFO.stickerAuthor;
global.week = global.BOT_INFO.weekInfo;
global.wibb = global.BOT_INFO.shortTime;

// Redes sociales y enlaces
const SOCIALS = {
    instagram: 'https://www.instagram.com/joan_tk02',
    github: 'https://github.com/JJoan02/Admin-TK',
    whatsappChannel: 'https://whatsapp.com/channel/0029VawpOoGHwXb6LgJkXN2R',
    whatsappLink: 'https://wa.me/51910234457',
    discord: '-', // Discord (editar si es necesario)
    dashboard: 'https://dash.tk-joanhost.com/',
    facebook: 'https://www.facebook.com/',
    newsletter: '120363348355703366@newsletter',
    // Espacios en blanco para agregar nuevos enlaces:
    additionalSocial1: '', // EDITAR
    additionalSocial2: '', // EDITAR
};

/*============= ASIGNACIÓN GLOBAL =============*/
global.readMore = readMore;
global.author = BOT_INFO.author;
global.namebot = BOT_INFO.name;
global.wm = BOT_INFO.watermark;
global.watermark = BOT_INFO.watermark;
global.botdate = BOT_INFO.date;
global.bottime = BOT_INFO.time;
global.stickpack = BOT_INFO.stickerPack;
global.stickauth = BOT_INFO.stickerAuthor;
global.week = BOT_INFO.weekInfo;
global.wibb = BOT_INFO.shortTime;

global.sig = SOCIALS.instagram;
global.sgh = SOCIALS.github;
global.sgc = SOCIALS.whatsappChannel;
global.sgw = SOCIALS.whatsappLink;
global.sdc = SOCIALS.discord;
global.linkdash = SOCIALS.dashboard;
global.sfb = SOCIALS.facebook;
global.snh = SOCIALS.instagram; // Redundante con sig (editar si necesario)
global.idcanal = SOCIALS.newsletter;

/*============= FUNCIONES ÚTILES =============*/

// Imprimir información estructurada
const printBotInfo = () => {
    console.log('=== Información del Bot ===');
    console.log(`Autor: ${BOT_INFO.author}`);
    console.log(`Nombre: ${BOT_INFO.name}`);
    console.log(`Marca de Agua: ${BOT_INFO.watermark}`);
    console.log(`Fecha: ${BOT_INFO.date}`);
    console.log(`Hora: ${BOT_INFO.time}`);
    console.log('Enlaces sociales:');
    for (const [key, value] of Object.entries(SOCIALS)) {
        if (value) console.log(`- ${key}: ${value}`);
    }
};

// Ejecutar la impresión para verificar
printBotInfo();


/*============= DISEÑOS =============*/
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
global.wait = '✧ Espere un momento...'
global.eror = 'Error!'

/*============= WEB API KEY =============*/

global.APIs = {
  // name: 'https://website'
  xzn : 'https://skizo.tech/',
}

global.APIKeys = { // APIKey Here
  // 'https://website': 'apikey'

  'https://skizo.tech/' : 'GataDios',
}

/*============= OTROS =============*/
global.dpptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
global.ddocx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
global.dxlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
global.dpdf = 'application/pdf'
global.drtf = 'text/rtf'

global.hwaifu = ['https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg']

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
