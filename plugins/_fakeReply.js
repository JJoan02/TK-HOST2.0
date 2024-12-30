/*******************************/
/*  Archivo: plugins/_fakeReply.js
    Ajustado para que no dé 
    ReferenceError con fs ni 
    botname ni textbot, etc.
*/
/*******************************/

// 1. Importamos 'fs' o la función que necesitemos
import * as fs from 'fs'

// 2. Si tu proyecto no define getRandom() en alguna parte global, puedes hacerlo aquí:
Array.prototype.getRandom = function() {
  return this[Math.floor(Math.random() * this.length)]
}

// 3. Definimos variables que en tu código aparecen pero no estaban declaradas
const wm = 'Mi Watermark'          // Ej.: 'TK-HOST'
const botname = 'Mi Bot'           // Nombre que aparecerá como 'title'
const textbot = 'Texto personalizado del bot'
const packname = 'Mi Paquete'      // Ej.: Nombre del "paquete" de stickers
const group = 'https://chat.whatsapp.com/...'  // Grupo de soporte
const imagen2 = 'https://i.ibb.co/FDyNygX/file.jpg'  // Cualquier imagen que quieras

// 4. Tu plugin (antes)
export async function before(m, { conn }) {
  let name = '⛄𝐓𝐊 𝐇𝐎𝐒𝐓 - 𝐁𝐎𝐓 𝐂𝐇𝐀𝐍𝐍𝐄𝐋🌲'
  let imagenes = [
    "https://i.ibb.co/f9kvM3S/file.jpg",
    "https://i.ibb.co/wCPxV2D/file.jpg",
    "https://i.ibb.co/wCPxV2D/file.jpg",
    "https://i.ibb.co/FDyNygX/file.jpg"
  ]

  let icono = imagenes[Math.floor(Math.random() * imagenes.length)]

  // Enlaces
  var canal = 'https://whatsapp.com/channel/0029VaS4zeE72WTyg5et571r'
  var git = 'https://github.com/JJoan02'
  var github = 'https://github.com/JJoan02/TK-HOST'
  let tiktok = 'https://www.tiktok.com/@joan_tk02'
  let correo = 'sm.joanbottk@gmail.com'

  // Este arreglo luego se usa con getRandom()
  global.redes = [canal, git, github, tiktok, correo].getRandom()

  // id canales
  global.canalIdM = ["120363205895430548@newsletter", "120363233459118973@newsletter"]

  // Objeto con forward y externalAdReply
  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363233459118973@newsletter",
        serverMessageId: 100,
        newsletterName: name,
      },
      externalAdReply: {
        showAdAttribution: true,
        title: botname,    // <= Usamos la variable que definimos arriba
        body: textbot,     // <= También la variable
        mediaUrl: null,
        description: null,
        previewType: "PHOTO",
        thumbnailUrl: icono,
        sourceUrl: canal,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }

  // Otro ejemplo de array con .getRandom()
  global.icono = [
    'https://qu.ax/yyCo.jpeg',
    'https://qu.ax/yyCo.jpeg',
    'https://qu.ax/qJch.jpeg',
    'https://qu.ax/qJch.jpeg',
    'https://qu.ax/CHRS.jpeg',
    'https://qu.ax/CHRS.jpeg',
  ].getRandom()

  // Ejemplo de "contactMessage" usando fs
  global.fkontak = {
    key: {
      fromMe: false,
      participant: `0@s.whatsapp.net`,
      ...(m.chat ? { remoteJid: `status@broadcast` } : {})
    },
    message: {
      'contactMessage': {
        'displayName': wm, // Usamos la var wm
        'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${wm},;;;\nFN:${wm},\nitem1.TEL;waid=${
          m.sender.split('@')[0]
        }:${m.sender.split('@')[0]}\nitem1.X-ABLabell:Ponsel\nEND:VCARD`,
        'jpegThumbnail': fs.readFileSync('./storage/img/catalogo.png'),
        thumbnail: fs.readFileSync('./storage/img/catalogo.png'),
        sendEphemeral: true
      }
    }
  }

  // Respuesta con enlace de WhatsApp
  global.rpl = {
    contextInfo: {
      externalAdReply: {
        mediaUrl: group,           // ← definimos la url arriba
        mediaType: 'VIDEO',
        description: 'support group',
        title: packname,           // ← definimos la var arriba
        body: 'grupo de soporte',
        thumbnailUrl: imagen2,     // ← definimos imagen2
        sourceUrl: group,
      }
    }
  }

  // Fake reply
  global.fake = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363233459118973@newsletter",
        serverMessageId: 100,
        newsletterName: name,
      },
    },
  }
}
