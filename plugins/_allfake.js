import fs from 'fs'
import fetch from 'node-fetch'
import moment from 'moment-timezone'

let handler = m => m
handler.all = async function (m) {
    let name = await conn.getName(m.sender)
    let pp = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
    try {
        pp = await this.profilePictureUrl(m.sender, 'image')
    } catch (e) {
    } finally {

        global.doc = pickRandom(["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/pdf"])

        // Modulo 
        global.fetch = (await import('node-fetch')).default
        global.bochil = await import('@bochilteam/scraper')
        global.fs = fs

        const _uptime = process.uptime() * 1000


        global.ucapan = ucapan()

        global.ephemeral = '86400'


global.rcanal = {
 contextInfo: {
     	isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: global.idcanal,
      serverMessageId: 100,
      newsletterName: global.ucapan,
   }, 
   externalAdReply: {
    showAdAttribution: true, 
    title: "Waguri Ai ✧", 
    body: wm, 
    mediaUrl: "https://pomf2.lain.la/f/ut2z21cs.jpg", 
    description: null, 
    previewType: "PHOTO", 
    thumbnailUrl: "https://pomf2.lain.la/f/ut2z21cs.jpg", 
    thumbnail: fs.readFileSync('./media/reply_img.jpg'),
    sourceUrl: sig, 
    mediaType: 1, 
    previewType: 0,
    renderLargerThumbnail: false 
    }, 
    }, 
    }
    

global.adReply = {
    contextInfo: {
    	isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: global.idcanal,
      serverMessageId: 100,
      newsletterName: global.ucapan,
    },
    },
  }

        global.sig = {
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: global.ucapan,
                    body: wm,
                    thumbnailUrl: pp,
                    sourceUrl: sig
                }
            }
        }
        global.sfb = {
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: global.ucapan,
                    body: wm,
                    thumbnailUrl: pp,
                    sourceUrl: sfb
                }
            }
        }
        // Fake 🤥
        global.ftroli = { key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net' }, message: { orderMessage: { itemCount: 9999999999999999999999999999999999999999999999999999999, status: 1, surface: 1, message: wm, orderTitle: wm, sellerJid: '0@s.whatsapp.net' } } }
        global.fkontak = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `status@broadcast` } : {}) }, message: { 'contactMessage': { 'displayName': wm, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${wm},;;;\nFN:${wm},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabell:Ponsel\nEND:VCARD`, 'jpegThumbnail': fs.readFileSync('./thumbnail.jpg'), thumbnail: fs.readFileSync('./thumbnail.jpg'), sendEphemeral: true } } }
        global.fvn = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ?
                    { remoteJid: "6282127487538-1625305606@g.us" } : {})
            },
            message: {
                "audioMessage": {
                    "mimetype": "audio/ogg; codecs=opus",
                    "seconds": "999999999999",
                    "ptt": "true"
                }
            }
        }

global.keni = { key : {
remoteJid: '0@s.whatsapp.net',
participant : '0@s.whatsapp.net'
},
message: {
newsletterAdminInviteMessage: {
newsletterJid: '120363210705976689@newsletter',
    newsletterName: '',
    caption: `${wm} | 2022 - 2025`
}}}

        global.ftextt = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ?
                    { remoteJid: "6282127487538-1625305606@g.us" } : {})
            },
            message: {
                "extendedTextMessage": {
                    "text": wm,
                    "title": wm,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        }

        global.fliveLoc = {
            key:
            {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ?
                    { remoteJid: "status@broadcast" } : {})
            },
            message: { "liveLocationMessage": { "caption": "by : WH MODS DEV", "h": `${wm}`, 'jpegThumbnail': fs.readFileSync('./thumbnail.jpg') } }
        }

        global.fliveLoc2 = {
            key:
            {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ?
                    { remoteJid: "status@broadcast" } : {})
            },
            message: { "liveLocationMessage": { "title": "WH MODS DEV", "h": wm, 'jpegThumbnail': fs.readFileSync('./thumbnail.jpg') } }
        }

        global.ftoko = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "6282127487538@s.whatsapp.net" } : {})
            },
            message: {
                "productMessage": {
                    "product": {
                        "productImage": {
                            "mimetype": "image/jpeg",
                            "jpegThumbnail": fs.readFileSync('./thumbnail.jpg') //Gambarnye
                        },
                        "title": wm, 
                        "description": "Simple Bot Esm",
                        "currencyCode": "USD",
                        "priceAmount1000": "20000000",
                        "retailerId": "Ghost",
                        "productImageCount": 1
                    },
                    "businessOwnerJid": `0@s.whatsapp.net`
                }
            }
        }

        global.fdocs = {
            key: {
                participant: '0@s.whatsapp.net'
            },
            message: {
                documentMessage: {
                    title: wm,
                    jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
                }
            }
        }

        global.fgclink = {
            "key": {
                "fromMe": false,
                "participant": "0@s.whatsapp.net",
                "remoteJid": "0@s.whatsapp.net"
            },
            "message": {
                "groupInviteMessage": {
                    "groupJid": "6282127487538-1625305606@g.us",
                    "inviteCode": "null",
                    "groupName": "Kawan WH MODS DEV",
                    "caption": wm,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        }

        global.fgif = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ?
                    { remoteJid: "6282127487538-1625305606@g.us" } : {})
            },
            message: {
                "videoMessage": {
                    "title": wm,
                    "h": `Hmm`,
                    'seconds': '999999999',
                    'gifPlayback': 'true',
                    'caption': wm,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        }
    }
}

export default handler

function ucapan() {
    const time = moment.tz('America/Buenos_Aires').format('HH')
    let res = "¿Aún despiertx?, Duerme mejor. 🌙"
    if (time >= 5) {
        res = "Buena Madrugada 🌄"
    }
    if (time > 10) {
        res = "Buenos días ☀️"
    }
    if (time >= 12) {
        res = "Buenas Tardes 🌅"
    }
    if (time >= 19) {
        res = "Buenas Noches 🌙"
    }
    return res
}

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
}