/**
 * Este script es un manejador para automatización en bots de mensajería.
 * Se enfoca en personalizar mensajes y respuestas basadas en horarios, estructuras globales y
 * otros elementos para mejorar la experiencia del usuario.
 * Actualizado por Joan TK
 */

import fs from 'fs';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

let handler = (m) => m;

handler.all = async function (m) {
    let name = await conn.getName(m.sender);
    let pp = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg';
    try {
        pp = await this.profilePictureUrl(m.sender, 'image');
    } catch (e) {
        console.log('No se pudo cargar la foto de perfil.');
    } finally {
        // Documentos aleatorios
        global.doc = pickRandom([
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/pdf"
        ]);

        // Carga de módulos globales
        global.fetch = fetch;
        global.fs = fs;
        global.ucapan = ucapan();
        global.ephemeral = '86400';

        // Configuración de respuestas globales
        global.rcanal = createAdReply(global.ucapan, wm, pp, 'https://pomf2.lain.la/f/ut2z21cs.jpg');
        global.adReply = createAdReply(global.ucapan, wm, pp);
        global.sig = createSimpleReply(global.ucapan, wm, pp);
        global.sfb = createSimpleReply(global.ucapan, wm, pp);

        // Mensajes falsos (fake)
        global.ftroli = createFakeMessage(wm);
        global.fkontak = createContactMessage(wm, m.sender);
        global.fvn = createAudioMessage();
        global.keni = createNewsletterMessage(wm);

        // Más estructuras globales
        global.ftextt = createExtendedTextMessage(wm);
        global.fliveLoc = createLiveLocationMessage(wm);
        global.fliveLoc2 = createLiveLocationMessage(wm, "WH MODS DEV");
        global.ftoko = createProductMessage(wm);
        global.fdocs = createDocumentMessage(wm);
        global.fgclink = createGroupInviteMessage(wm);
        global.fgif = createGifMessage(wm);

        // Final del handler
    }
};

export default handler;

/** Funciones auxiliares */

// Mensajes según la hora
function ucapan() {
    const time = moment.tz('America/Lima').format('HH');
    if (time < 5) return "¿Aún despierto? Descansa bien. 🌙";
    if (time >= 5 && time < 8) return "¡Buena madrugada! ¿Café o té? 🌄";
    if (time >= 8 && time < 12) return "¡Buenos días! A brillar como el sol. ☀️";
    if (time >= 12 && time < 14) return "Es mediodía. ¡Hora de comer algo rico! 🍽️";
    if (time >= 14 && time < 18) return "Buenas tardes, ¿un descanso y seguimos? 🌅";
    if (time >= 18 && time < 21) return "Buenas noches, ¡relájate un poco! 🌙";
    return "Es tarde, ¡hora de dormir! 🌌";
}

// Selección aleatoria
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// Crear respuestas específicas
function createAdReply(title, body, thumbnailUrl, mediaUrl = '') {
    return {
        contextInfo: {
            externalAdReply: {
                showAdAttribution: true,
                title,
                body,
                thumbnailUrl,
                mediaUrl
            }
        }
    };
}

function createSimpleReply(title, body, thumbnailUrl) {
    return {
        contextInfo: {
            externalAdReply: {
                title,
                body,
                thumbnailUrl
            }
        }
    };
}

function createFakeMessage(message) {
    return {
        key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net' },
        message: {
            orderMessage: {
                itemCount: 999999,
                status: 1,
                surface: 1,
                message,
                orderTitle: message,
                sellerJid: '0@s.whatsapp.net'
            }
        }
    };
}

function createContactMessage(displayName, sender) {
    return {
        key: { participant: `0@s.whatsapp.net` },
        message: {
            contactMessage: {
                displayName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;\nFN:${displayName}\nTEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nEND:VCARD`,
                jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
            }
        }
    };
}

function createAudioMessage() {
    return {
        key: { participant: `0@s.whatsapp.net` },
        message: {
            audioMessage: {
                mimetype: "audio/ogg; codecs=opus",
                seconds: 999999,
                ptt: true
            }
        }
    };
}

function createNewsletterMessage(caption) {
    return {
        key: { remoteJid: '0@s.whatsapp.net', participant: '0@s.whatsapp.net' },
        message: {
            newsletterAdminInviteMessage: {
                newsletterJid: '120363210705976689@newsletter',
                newsletterName: '',
                caption: `${caption} | 2022 - 2025`
            }
        }
    };
}

function createExtendedTextMessage(text) {
    return {
        key: { participant: `0@s.whatsapp.net` },
        message: {
            extendedTextMessage: {
                text,
                title: text,
                jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
            }
        }
    };
}

function createLiveLocationMessage(caption, title = "WH MODS DEV") {
    return {
        key: { participant: `0@s.whatsapp.net` },
        message: {
            liveLocationMessage: {
                caption,
                title,
                jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
            }
        }
    };
}

function createProductMessage(title) {
    return {
        key: { participant: `0@s.whatsapp.net` },
        message: {
            productMessage: {
                product: {
                    productImage: {
                        mimetype: "image/jpeg",
                        jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
                    },
                    title,
                    description: "Producto simple",
                    currencyCode: "USD",
                    priceAmount1000: 20000000,
                    retailerId: "Retailer",
                    productImageCount: 1
                },
                businessOwnerJid: `0@s.whatsapp.net`
            }
        }
    };
}

function createDocumentMessage(title) {
    return {
        key: { participant: '0@s.whatsapp.net' },
        message: {
            documentMessage: {
                title,
                jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
            }
        }
    };
}

function createGroupInviteMessage(caption) {
    return {
        key: { participant: `0@s.whatsapp.net` },
        message: {
            groupInviteMessage: {
                groupJid: "0@s.whatsapp.net",
                inviteCode: "null",
                groupName: "Grupo de ejemplo",
                caption,
                jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
            }
        }
    };
}

function createGifMessage(title) {
    return {
        key: { participant: `0@s.whatsapp.net` },
        message: {
            videoMessage: {
                title,
                seconds: 999999,
                gifPlayback: true,
                caption: title,
                jpegThumbnail: fs.readFileSync('./thumbnail.jpg')
            }
        }
    };
}
