import fs, { promises } from 'fs';
import fetch from 'node-fetch';
import moment from 'moment-timezone';
import 'moment/locale/es';  // Importa el idioma español

// Establece el idioma español para moment
moment.locale('es');

// Función principal del handler que genera el menú interactivo
let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let d = new Date();
    let locale = 'es';
    // Ajusta la hora al huso horario de Lima, Perú (GMT-5)
    let limaTime = moment.tz(d, 'America/Lima');
    let hours = limaTime.hours();
    let saludo;

    // Determina el saludo según la hora del día
    if (hours === 0) {
      saludo = '🌚 ¡Vaya, aún despierto! ¿Eres un búho nocturno o qué?';
    } else if (hours === 1) {
      saludo = '🌚 ¿Ya es la 1 AM? ¡Aún no es hora de dormir!';
    } else if (hours === 2) {
      saludo = '🌚 Las 2 de la mañana, ¡un verdadero noctámbulo!';
    } else if (hours === 3) {
      saludo = '🌚 Son las 3 AM, ¿seguro que no deberías dormir?';
    } else if (hours === 4) {
      saludo = '🌅 ¡Buenos días, madrugador! ¿O te has quedado despierto toda la noche?';
    } else if (hours === 5) {
      saludo = '🌅 Son las 5 AM, ¡un verdadero madrugador!';
    } else if (hours === 6) {
      saludo = '🌅 Son las 6 AM, ¡el sol está saliendo!';
    } else if (hours === 7) {
      saludo = '🌄 ¡Buenos días! Hora de levantarse y brillar... o al menos intentarlo.';
    } else if (hours === 8) {
      saludo = '🌄 Son las 8 AM, ¡es hora de empezar el día!';
    } else if (hours === 9) {
      saludo = '🌞 Buenos Días, ¡espero que ya estés despierto!';
    } else if (hours === 10) {
      saludo = '🌞 Las 10 de la mañana, ¡un buen momento para ser productivo!';
    } else if (hours === 11) {
      saludo = '🌞 Son las 11 AM, ¡casi es hora del almuerzo!';
    } else if (hours === 12) {
      saludo = '🌤 Buenas Tardes, ¿listo para la siesta después del almuerzo?';
    } else if (hours === 13) {
      saludo = '🌤 Son las 1 PM, ¡espero que hayas disfrutado tu almuerzo!';
    } else if (hours === 14) {
      saludo = '🌇 Buenas Tardes, ¡la recta final del día!';
    } else if (hours === 15) {
      saludo = '🌇 Son las 3 PM, ¡mantén el ritmo!';
    } else if (hours === 16) {
      saludo = '🌇 Son las 4 PM, ¡ya casi es el fin del día!';
    } else if (hours === 17) {
      saludo = '🌆 Buenas Tardes, ¡el día se va acabando, pero no tus tareas!';
    } else if (hours === 18) {
      saludo = '🌆 Son las 6 PM, ¡es hora de relajarse un poco!';
    } else if (hours === 19) {
      saludo = '🌜 Buenas Noches, ¿hora de Netflix y relax?';
    } else if (hours === 20) {
      saludo = '🌜 Son las 8 PM, ¡un buen momento para relajarse!';
    } else if (hours === 21) {
      saludo = '🌜 Buenas Noches, ¿preparado para el último sprint del día?';
    } else if (hours === 22) {
      saludo = '🌜 Son las 10 PM, ¡hora de prepararse para dormir!';
    } else if (hours === 23) {
      saludo = '🌙 Buenas Noches, ¿no deberías estar durmiendo ya?';
    }

    let week = limaTime.format('dddd');
    let date = limaTime.format('D [de] MMMM [del] YYYY');
    let time = limaTime.format('LTS');
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
    let taguser = conn.getName(m.sender);
    let user = global.db.data.users[m.sender];
    let totalUsers = Object.keys(global.db.data.users).length;

    // Datos de contacto para el mensaje
    let fkontak = {
      "key": { "participants": "0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" },
      "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
      "participant": "0@s.whatsapp.net"
    };

    // Genera el contenido del menú
    let menu = `
*¡Hola ◈ ${user.registered === true ? user.name : `👉 ${usedPrefix}verificar nombre.edad`} ◈*
> ${saludo} ${taguser}!

╭━━━✦ *𝕀𝕟𝕗𝕠𝕣𝕞𝕒𝕔𝕚ó𝕟 𝔸𝕕𝕞𝕚𝕟-𝕋𝕂* ✦━━━╮
┃ ✦ *Fecha:* ${week}, ${date}
┃ ✦ *Hora:* ${time}
┃ ✦ *Tiempo de Actividad:* ${uptime}
┃ ✦ *Total de Usuarios:* ${totalUsers}
┃ ✦ *Usuarios Registrados:* ${rtotalreg}
╰━━━━━━━━━━━━━━━━━━━╯

*˚₊·˚₊· ͟͟͞͞➳❥* 𝑱𝒐𝒂𝒏𝑨𝒅𝒎𝒊𝒏-𝑻𝑲
*☆═━┈◈ ╰ 1.4.0TK ╯ ◈┈━═☆

╭─❑ 「 📋 Información del Menú 」 ❑──
│ ➜ .codigo
│ ➜ .contacto
│ ➜ .creador
│ ➜ .cuentasTK
│ ➜ .donar
│ ➜ .estado
│ ➜ .gruposTK
│ ➜ .grupolista
│ ➜ .infojoan
│ ➜ .instalarbot
│ ➜ .términos y condiciones
│ ➜ .velocidad
╰───────────────

╭─❑ 「 ✅ Ser Verificado 」 ❑──
│ ➜ .anulareg *id de registro*
│ ➜ .idregistro
│ ➜ .verificar *nombre.edad*
╰───────────────

╭─❑ 「 👥 Grupo 」 ❑──
│ ➜ .admins
│ ➜ .advertencia *@tag*
│ ➜ .banchat
│ ➜ .banuser *@tag*
│ ➜ .cambiardesc *texto*
│ ➜ .cambiarnombre *texto*
│ ➜ .cambiarpp *imagen*
│ ➜ .daradmin *tag*
│ ➜ .deladvertencia *@tag*
│ ➜ .delwarn *@tag*
│ ➜ .desprohibir *tag*
│ ➜ .enlace | link
│ ➜ .grupo abrir
│ ➜ .grupo cerrar
│ ➜ .grupotiempo | grouptime *Cantidad*
│ ➜ .hidetag *texto*
│ ➜ .infogrupo | infogroup
│ ➜ .inspeccionar *enlace*
│ ➜ .invitar *número*
│ ➜ .invocar *texto*
│ ➜ .mute | unmute *@tag*
│ ➜ .newdesc | descripcion *texto*
│ ➜ .newnombre | nuevonombre *texto*
│ ➜ .notificar *texto*
│ ➜ .prohibir *tag*
│ ➜ .quitaradmin *tag*
│ ➜ .resetlink | nuevoenlace
│ ➜ .sacar | ban | kick *@tag*
│ ➜ .setbye | despedida *texto*
│ ➜ .setwelcome | bienvenida *texto*
│ ➜ .tagall *texto*
│ ➜ .unbanchat
│ ➜ .unbanuser *@tag*
╰───────────────

╭─❑ 「 ⚙️ Configuración 」 ❑──
│ ➜ off
│ ➜ on
╰───────────────

╭─❑ 「 🎮 Juegos 」 ❑──
│ ➜ .chiste
│ ➜ .doxxear *@tag*
│ ➜ .frases [cantidad 1 al 99]
│ ➜ .gay *@tag*
│ ➜ .lesbiana *@tag* o [nombre]
│ ➜ .manca *@tag* o [nombre]
│ ➜ .manco *@tag* o [nombre]
│ ➜ .piropo
│ ➜ .reto
│ ➜ .ruletadelban
│ ➜ .toplind@s
│ ➜ .topput@s
╰───────────────

╭─❑ 「 🤖 IA 」 ❑──
│ ➜ .delchatgpt
│ ➜ .hd (responde con una imagen)
│ ➜ .ia [texto]
│ ➜ .iavoz [texto]
╰───────────────

╭─❑ 「 📥 Descargas 」 ❑──
│ ➜ .clima *país ciudad*
│ ➜ .consejo
│ ➜ .facebook | fb *link*
│ ➜ .ighistoria | igstory *usuario(a)*
│ ➜ .imagen | image *texto*
│ ➜ .instagram *link video o imagen*
│ ➜ .pdocvieo | ytvdoc *link*
│ ➜ .pinterest | dlpinterest *texto*
│ ➜ .play | play2 *texto o link*
│ ➜ .play.1 *texto o link*
│ ➜ .play.2 *texto o link*
│ ➜ .tiktok *link*
│ ➜ .tiktokfoto | tiktokphoto *usuario(a)*
│ ➜ .tiktokimagen | ttimagen *link*
│ ➜ .tw | twdl | twitter *link*
│ ➜ .verig | igstalk *usuario(a)*
│ ➜ .ytmp4 | ytv *link*
╰───────────────

╭─❑ 「 💞 Parejas 」 ❑──
│ ➜ .aceptar | accept *@tag*
│ ➜ .listaparejas | listship
│ ➜ .mipareja | mylove
│ ➜ .pareja | couple *@tag*
│ ➜ .rechazar | decline *@tag*
│ ➜ .terminar | finish *@tag*
╰───────────────

╭─❑ 「 🔄 Convertidores 」 ❑──
│ ➜ .toenlace *video, imagen o audio*
│ ➜ .toimg | img | jpg *sticker*
│ ➜ .tourl *video, imagen*
│ ➜ .tts es *texto*
╰───────────────

╭─❑ 「 🛠️ Herramientas 」 ❑──
│ ➜ .afk *motivo*
╰───────────────

╭─❑ 「 🎭 Filtros en Stickers 」 ❑──
│ ➜ .sticker | s *imagen o video*
│ ➜ .sticker | s *url de tipo jpg*
╰───────────────

╭─❑ 「 👻 Stickers Dinámicos 」 ❑──
│ ➜ .alimentar | food *@tag*
│ ➜ .bofetada | slap *@tag*
│ ➜ .golpear *@tag*
│ ➜ .palmaditas | pat *@tag*
│ ➜ .besar | kiss *@tag*
╰───────────────

╭─❑ 「 🤖 Comandos - Sub Bot 」 ❑──
│ ➜ .bcbot
│ ➜ .borrarsesion
│ ➜ .bots
│ ➜ .detener
│ ➜ .serbot
│ ➜ .serbot --code
╰───────────────

╭─❑ 「 ⏳ Admin-TK Temporal 」 ❑──
│ ➜ .botemporal [enlace] [cantidad]
╰───────────────

╭─❑ 「 👑 Propietario(a) 」 ❑──
│ ➜ .actualizar
│ ➜ .banearchat
│ ➜ .banusuario *@tag*
│ ➜ .bc *texto*
│ ➜ .bcc *texto*
│ ➜ .bcgc *texto*
│ ➜ .bcsubbot *texto*
│ ➜ .bloquear *@tag*
│ ➜ .borrardatos *número*
│ ➜ .borrartmp | cleartmp
│ ➜ .desbanearchat
│ ➜ .desbanusuario *@tag*
│ ➜ .desbloquear *@tag*
│ ➜ .nuevafotobot *imagen*
│ ➜ .nuevabiobot *texto*
│ ➜ .nuevonombrebot *texto*
│ ➜ .obtenercodigo *nombre de archivo*
│ ➜ .reiniciar | restart
│ ➜ .respaldo
│ ➜ .salir
│ ➜ .tenerpoder
│ ➜ .unete *enlace*
╰───────────────
`.trim();
    
    // Lista de videos para enviar
    const vi = ['https://telegra.ph/file/fc13fb2f0013c228b0dbb.mp4',
'https://telegra.ph/file/dfb3e60ed9313c07f7b25.mp4',
'https://telegra.ph/file/d5ac5bd25ed39796a111a.mp4',
'https://telegra.ph/file/688fb3f48c2fe4194dd4f.mp4',
'https://telegra.ph/file/699049ef8cb41bec77f38.mp4'];

    // Envío del mensaje con un video
    try {
      await conn.sendMessage(m.chat, { video: { url: vi.getRandom() }, gifPlayback: true, caption: menu, contextInfo: fkontak });
    } catch (error) {
      try {
        await conn.sendMessage(m.chat, { image: { url: gataMenu.getRandom() }, gifPlayback: false, caption: menu, mentions: [m.sender, global.conn.user.jid] }, { quoted: fkontak });
      } catch (error) {
        try {
          await conn.sendMessage(m.chat, { image: gataImg.getRandom(), gifPlayback: false, caption: menu, mentions: [m.sender, global.conn.user.jid] }, { quoted: fkontak });
        } catch (error) {
          try {
            await conn.sendFile(m.chat, imagen5, 'menu.jpg', menu, fkontak, false, { mentions: [m.sender, global.conn.user.jid] });
          } catch (error) {
            return;
          }
        }
      }
    } 
  } catch (e) {
    await m.reply(lenguajeGB['smsMalError3']() + '\n*' + lenguajeGB.smsMensError1() + '*\n*' + usedPrefix + `${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}` + '* ' + `${lenguajeGB.smsMensError2()} ` + usedPrefix + command);
    console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`);
    console.log(e);
  }
};

handler.command = /^(menu|menú|memu|memú|help|info|comandos|2help|menu1.2|ayuda|commands|commandos|menucompleto|allmenu|allm|m|\?)$/i;
export default handler;

// Función para convertir el tiempo de actividad en formato legible
function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}
