import fs from 'fs';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

let handler = m => m;

handler.all = async function (m) {
    let name = await conn.getName(m.sender);
    let pp = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg';

    try {
        pp = await this.profilePictureUrl(m.sender, 'image');
    } catch (e) {
        console.error('⚠️ No se pudo obtener la imagen de perfil del usuario. Usando imagen predeterminada.');
    } finally {
        // Configuración de archivos globales
        global.doc = pickRandom([
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/pdf"
        ]);

        // Cargar módulos
        global.fetch = (await import('node-fetch')).default;
        global.bochil = await import('@bochilteam/scraper');
        global.fs = fs;

        // Tiempo de actividad del bot
        const _uptime = process.uptime() * 1000;

        // Saludo dinámico según la hora del día
        global.ucapan = ucapan();

        // Duración de mensajes efímeros
        global.ephemeral = '86400';

        // Configuración de respuestas para mensajes automáticos con tono amigable de Admin-TK
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
                    title: "Admin-TK ✧",
                    body: wm,
                    mediaUrl: "https://pomf2.lain.la/f/onvv8i5b.jpg",
                    description: null,
                    previewType: "PHOTO",
                    thumbnailUrl: "https://pomf2.lain.la/f/onvv8i5b.jpg",
                    thumbnail: fs.readFileSync('./media/reply_img.jpg'),
                    sourceUrl: sig,
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: false
                },
            },
        };

        global.adReply = {
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idcanal,
                    serverMessageId: 100,
                    newsletterName: global.ucapan,
                },
            },
        };

        global.sig = {
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: global.ucapan,
                    body: wm,
                    thumbnailUrl: pp,
                    sourceUrl: sig,
                },
            },
        };

        global.sfb = {
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: global.ucapan,
                    body: wm,
                    thumbnailUrl: pp,
                    sourceUrl: sfb,
                },
            },
        };

        // Mensajes falsos y respuestas automáticas
        global.ftroli = {
            key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net' },
            message: {
                orderMessage: {
                    itemCount: 9999999999999999,
                    status: 1,
                    surface: 1,
                    message: wm,
                    orderTitle: wm,
                    sellerJid: '0@s.whatsapp.net'
                }
            }
        };

        global.fkontak = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `status@broadcast` } : {}) },
            message: {
                'contactMessage': {
                    'displayName': wm,
                    'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${wm},;;;\nFN:${wm},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabell:Ponsel\nEND:VCARD`,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg'),
                    sendEphemeral: true
                }
            }
        };

        global.fvn = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "6282127487538-1625305606@g.us" } : {})
            },
            message: {
                "audioMessage": {
                    "mimetype": "audio/ogg; codecs=opus",
                    "seconds": "999999999",
                    "ptt": true
                }
            }
        };

        global.keni = {
            key: {
                remoteJid: '0@s.whatsapp.net',
                participant: '0@s.whatsapp.net'
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363210705976689@newsletter',
                    newsletterName: '',
                    caption: `${wm} | 2022 - 2025`
                }
            }
        };

        global.ftextt = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "6282127487538-1625305606@g.us" } : {})
            },
            message: {
                "extendedTextMessage": {
                    "text": wm,
                    "title": wm,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        };

        global.fliveLoc = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "status@broadcast" } : {})
            },
            message: {
                "liveLocationMessage": {
                    "caption": "by : Admin-TK ✧",
                    "h": `${wm}`,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        };

        global.fliveLoc2 = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "status@broadcast" } : {})
            },
            message: {
                "liveLocationMessage": {
                    "title": "Admin-TK ✧",
                    "h": wm,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        };

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
                            "jpegThumbnail": fs.readFileSync('./thumbnail.jpg')
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
        };

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
        };

        global.fgclink = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "0@s.whatsapp.net"
            },
            message: {
                "groupInviteMessage": {
                    "groupJid": "6282127487538-1625305606@g.us",
                    "inviteCode": "null",
                    "groupName": "Kawan Admin-TK ✧",
                    "caption": wm,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        };

        global.fgif = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "6282127487538-1625305606@g.us" } : {})
            },
            message: {
                "videoMessage": {
                    "title": wm,
                    "h": `Hmm`,
                    'seconds': '999999999',
                    'gifPlayback': true,
                    'caption': wm,
                    'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')
                }
            }
        };
    }
};

export default handler;

// Función para generar un saludo específico según la hora del día en Lima, Perú (formato 24 horas)
function ucapan() {
    const time = moment.tz('America/Lima').format('HH');
    let res;

    switch (parseInt(time)) {
        case 0:
            res = "🌙 Medianoche, espero que descanses bien. 🌙";
            break;
        case 1:
            res = "🌙 Es muy tarde, recuerda descansar bien. 🌙";
            break;
        case 2:
            res = "🌙 Deberías dormir para tener un buen día mañana. 🌙";
            break;
        case 3:
            res = "🌙 Que tengas dulces sueños. 🌙";
            break;
        case 4:
            res = "🌙 ¡Muy temprano! Espero que estés descansando. 🌙";
            break;
        case 5:
            res = "🌄 ¡Buena madrugada! Espero que estés bien. 🌄";
            break;
        case 6:
            res = "🌄 Buenos días, que tengas una excelente mañana. 🌄";
            break;
        case 7:
            res = "☀️ ¡Buenos días! Ya empieza el día con energía. ☀️";
            break;
        case 8:
            res = "☀️ Buenos días, espero que tu día sea excelente. ☀️";
            break;
        case 9:
            res = "☀️ ¡Hola! Que tengas una muy buena mañana. ☀️";
            break;
        case 10:
            res = "☀️ Buenos días, sigue adelante con tus objetivos. ☀️";
            break;
        case 11:
            res = "🌞 ¡Ya casi mediodía! Espero que todo esté bien. 🌞";
            break;
        case 12:
            res = "🕛 Es mediodía, hora de un descanso merecido. 🕛";
            break;
        case 13:
            res = "🌞 Buenas tardes, espero que hayas almorzado bien. 🌞";
            break;
        case 14:
            res = "🌞 Buenas tardes, ¡a seguir con energía! 🌞";
            break;
        case 15:
            res = "🌅 Buenas tardes, espero que estés cumpliendo tus metas. 🌅";
            break;
        case 16:
            res = "🌅 Buenas tardes, aún queda mucho por hacer. 🌅";
            break;
        case 17:
            res = "🌅 Buenas tardes, el día está terminando. 🌅";
            break;
        case 18:
            res = "🌇 Buenas tardes, el sol se está poniendo. 🌇";
            break;
        case 19:
            res = "🌙 Buenas noches, espero que hayas tenido un buen día. 🌙";
            break;
        case 20:
            res = "🌙 Buenas noches, es hora de relajarse. 🌙";
            break;
        case 21:
            res = "🌙 Buenas noches, descansa para tener un gran día mañana. 🌙";
            break;
        case 22:
            res = "🌙 Ya es tarde, ¡hora de descansar! 🌙";
            break;
        case 23:
            res = "🌙 Casi medianoche, que tengas un buen descanso. 🌙";
            break;
        default:
            res = "🌙 Espero que descanses bien. 🌙";
    }

    return res;
}

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())];
}

