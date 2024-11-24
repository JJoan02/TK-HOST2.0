// =======================================
// HANDLER PARA MENSAJES Y CONFIGURACIONES - Admin-TK
// =======================================
import fetch from 'node-fetch';
import moment from 'moment-timezone';
import axios from 'axios';
import fs from 'fs';

const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = (await import(global.baileys));

var handler = m => m;
handler.all = async function (m) {
  global.key = '';

  // Obtener datos desde un archivo JSON externo
  const response = await fetch('https://raw.githubusercontent.com/tuusuario/Admin-TK/master/official_accounts.json');
  const data = await response.json();
  let { accounts, channels, groups, collaboration, sponsors, others } = data.info;

  // Definir variables globales con la información obtenida
  global.yt = accounts.youTube;
  global.ig = accounts.instagram;
  global.md = accounts.adminTK_md;
  global.fb = accounts.facebook;
  global.tk = accounts.tiktok;
  global.ths = accounts.threads;
  global.paypal = accounts.paypal;
  global.asistencia = others.assistance_num;
  global.bot = 'wa.me/tu_numero'; // Reemplaza 'tu_numero' con tu número de WhatsApp
  global.cuentas = accounts.all;

  global.canal1 = channels.channel1;
  global.canal2 = channels.channel2;
  global.canal3 = channels.channel3;
  global.canal4 = channels.channel4;

  global.soporteAdminTK = others.group_support;
  global.grupo1 = groups.group1;
  global.grupo2 = groups.group2;
  global.grupo3 = groups.group3;
  global.grupo4 = groups.group4;
  global.grupo5 = groups.group5;
  global.grupo6 = groups.group6;

  global.grupo_collab1 = collaboration.group1;
  global.grupo_collab2 = collaboration.group2;
  global.grupo_collab3 = collaboration.group3;
  global.grupo_collab4 = collaboration.group4;

  global.patrocinador1 = sponsors.sponsor1;
  global.patrocinador2 = sponsors.sponsor2;
  global.patrocinador3 = sponsors.sponsor3;
  global.patrocinador4 = sponsors.sponsor4;

  // Seleccionar aleatoriamente elementos de listas
  global.canales = [global.canal1, global.canal2, global.canal3, global.canal4][Math.floor(Math.random() * 4)];
  global.welAdminTK = [global.tk, global.ig, global.md, global.yt, global.paypal, global.fb, global.ths, global.asistencia][Math.floor(Math.random() * 8)];
  global.redesMenu = [
    global.canal1,
    global.canal2,
    global.canal3,
    global.canal4,
    global.soporteAdminTK,
    global.grupo1,
    global.grupo2,
    global.grupo3,
    global.grupo4,
    global.grupo5,
    global.grupo6,
    global.md,
    global.ig,
    global.paypal,
    global.yt,
    global.asistencia,
    global.fb,
    global.tk
  ][Math.floor(Math.random() * 18)];
  global.accountsAdminTK = [
    global.canal1,
    global.canal2,
    global.canal3,
    global.canal4,
    global.tk,
    global.ig,
    global.yt,
    global.paypal,
    global.fb,
    global.ths,
    global.md,
    global.asistencia
  ][Math.floor(Math.random() * 12)];

  var canalesInfo = [
    { link: global.canal1, id: "channel_id_1", name: "Canal 1" },
    { link: global.canal2, id: "channel_id_2", name: "Canal 2" },
    { link: global.canal3, id: "channel_id_3", name: "Canal 3" }
  ];
  var indiceAleatorio = Math.floor(Math.random() * canalesInfo.length);
  var channelRD = canalesInfo[indiceAleatorio];

  // Cargar imágenes desde archivos locales (asegúrate de que las rutas sean correctas)
  global.imagen1 = fs.readFileSync("./media/menus/Menu1.jpg");
  global.imagen2 = fs.readFileSync("./media/menus/Menu2.jpg");
  global.imagen3 = fs.readFileSync("./media/menus/Menu3.jpg");
  // Agrega más imágenes si es necesario

  // Definir URLs de imágenes
  global.img = 'https://tuimagen.com/img1.jpg';
  global.img2 = 'https://tuimagen.com/img2.jpg';
  // Agrega más URLs de imágenes si es necesario

  // Seleccionar aleatoriamente imágenes y videos para el menú
  global.adminTKVidMenu = ['https://tuvideo.com/video1.mp4', 'https://tuvideo.com/video2.mp4'][Math.floor(Math.random() * 2)];
  global.adminTKMenu = [global.img, global.img2][Math.floor(Math.random() * 2)];
  global.adminTKImg = [global.imagen1, global.imagen2, global.imagen3][Math.floor(Math.random() * 3)];

  // Definir mensajes y objetos de contexto
  global.fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Hola"
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;Admin-TK;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Teléfono\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };

  // Ejemplo de mensaje con contexto de canal
  global.fakeChannel = {
    contextInfo: {
      mentionedJid: null,
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        serverMessageId: '',
        newsletterName: channelRD.name
      },
      externalAdReply: {
        title: wm,
        body: vs,
        mediaType: 1,
        renderLargerThumbnail: false,
        previewType: 'PHOTO',
        thumbnailUrl: global.adminTKImg,
        thumbnail: global.imagen1,
        sourceUrl: global.accountsAdminTK
      }
    },
    quoted: m
  };

  // Mensajes de espera
  global.wait = "⌛ *Cargando...*\n*✪✦✦⊹⊹⊹⊹⊹⊹⊹⊹✪* `20%`";
  global.waitt = "⏳ *Cargando....*\n*✪✦✦✦✦⊹⊹⊹⊹⊹⊹✪* `40%`";
  global.waittt = "⌛ *Cargando...*\n*✪✦✦✦✦✦✦⊹⊹⊹⊹✪* `60%`";
  global.waitttt = "⏳ *Cargando....*\n*✪✦✦✦✦✦✦✦✦⊹⊹✪* `80%`";
  global.waittttt = "⌛ *Procesando...*\n*✪✦✦✦✦✦✦✦✦✦✦✪* `100%`";

  // Aquí puedes continuar con el resto de tu código y adaptaciones necesarias
};

// Exportar el handler
export default handler;

// Función para mensajes de espera con edición
global.mensajesEditados = async function(conn, m) {
  const mensajes = [global.waitt, global.waittt, global.waitttt, global.waittttt];
  let key = await conn.sendMessage(m.chat, { text: global.wait, quoted: m });
  for (let i = 0; i < mensajes.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await conn.sendMessage(m.chat, { text: mensajes[i], edit: key });
  }
};

// Si no está ya definida, añade la función getRandom al prototipo de Array
if (!Array.prototype.getRandom) {
  Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
  };
}

