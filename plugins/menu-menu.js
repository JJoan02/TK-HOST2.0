// Este archivo sirve para generar un menú interactivo en el bot de WhatsApp con mensajes humorísticos y emojis para mejorar la experiencia del usuario.

import fs, { promises } from 'fs';
import fetch from 'node-fetch';

// Función principal del handler que genera el menú interactivo
let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let d = new Date();
    let locale = 'es';
    let hours = d.getHours();
    let saludo;
    
    // Determina el saludo según la hora del día
    if (hours >= 4 && hours < 7) {
      saludo = '🌅 ¡Buenos días, madrugador! ¿O te has quedado despierto toda la noche?';
    } else if (hours >= 7 && hours < 9) {
      saludo = '🌄 ¡Buenos días! Hora de levantarse y brillar... o al menos intentarlo.';
    } else if (hours >= 9 && hours < 12) {
      saludo = '🌞 Buenos Días, ¡espero que ya estés despierto!';
    } else if (hours >= 12 && hours < 14) {
      saludo = '🌤 Buenas Tardes, ¿listo para la siesta después del almuerzo?';
    } else if (hours >= 14 && hours < 17) {
      saludo = '🌇 Buenas Tardes, ¡la recta final del día!';
    } else if (hours >= 17 && hours < 19) {
      saludo = '🌆 Buenas Tardes, ¡el día se va acabando, pero no tus tareas!';
    } else if (hours >= 19 && hours < 21) {
      saludo = '🌜 Buenas Noches, ¿hora de Netflix y relax?';
    } else if (hours >= 21 && hours < 23) {
      saludo = '🌜 Buenas Noches, ¿preparado para el último sprint del día?';
    } else if (hours >= 23 && hours < 1) {
      saludo = '🌙 Buenas Noches, ¿no deberías estar durmiendo ya?';
    } else {
      saludo = '🌚 ¡Vaya, aún despierto! ¿Eres un búho nocturno o qué?';
    }

    let week = d.toLocaleDateString(locale, { weekday: 'long' });
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
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
*¡Hola ◈ ${user.registered === true ? user.name : `👉 ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'verificar nombre.edad' : 'verify name.age'}`} ◈*
> ${saludo} ${taguser}!

╭━━━✦ *𝕀𝕟𝕗𝕠𝕣𝕞𝕒𝕔𝕚𝕠́𝕟 𝔸𝕕𝕞𝕚𝕟-𝕋𝕂* ✦━━━╮
┃ ✦ *Fecha:* ${week}, ${date}
┃ ✦ *Hora:* ${d.toLocaleTimeString(locale)}
┃ ✦ *Tiempo de Actividad:* ${uptime}
┃ ✦ *Total de Usuarios:* ${totalUsers}
┃ ✦ *Usuarios Registrados:* ${rtotalreg}
╰━━━━━━━━━━━━━━━━━━━╯

*˚₊·˚₊· ͟͟͞͞➳❥* ${packname}${conn.user.jid == global.conn.user.jid ? '' : `\n*˚₊·˚₊· ͟͟͞͞➳❥* 𝗚𝗕 - 𝗦𝗨𝗕 𝗕𝗢𝗧 ⇢ *@${global.conn.user.jid.split`@`[0]}*`}
*☆═━┈◈ ╰ ${vs}TK ╯ ◈┈━═☆*

╭─❑ 「 *${lenguajeGB.smsMenuTotal1()}* 」 ❑──
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'creador' : 'owner'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'contacto' : 'contact'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cuentasTK' : 'account'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'donar' : 'donate'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'codigo' : 'sc'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'gruposTK' : 'groupsgb'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'instalarbot' : 'installbot'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'grupolista' : 'grouplist'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'estado' : 'status'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'velocidad' : 'ping'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'infojoan' : 'infobot'}
│ ➜ ${lenguajeGB.lenguaje() == 'es' ? 'términos y condiciones' : 'terms'}
╰───────────────

╭─❑ 「 *${lenguajeGB.smsMenuTotal6()}* 」 ❑──
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'infogrupo' : 'groupinfo'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'admins' : 'admins'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'enlace' : 'linkgroup'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'inspeccionar *enlace*' : 'inspect *link*'}
╰───────────────

╭─❑ 「 *${lenguajeGB.smsMenuTotal7()}* 」 ❑──
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'notificar *texto*' : 'hidetag'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'sacar *tag*' : 'kick *tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'invitar *número*' : 'invite *number*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'daradmin *tag*' : 'promote *tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'quitaradmin *tag*' : 'demote *tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'prohibir *tag*' : 'deprive *tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desprohibir *tag*' : 'undeprive *tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'editarwelcome *texto*' : 'setwelcome'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'editarbye *texto*' : 'setbye'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cambiardesc *texto*' : 'setdesc'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cambiarnombre *texto*' : 'setname'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'cambiarpp *imagen*' : 'setppgc *image*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevoenlace' : 'resetlink'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'grupo abrir' : 'group open'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'grupo cerrar' : 'group close'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'invocar' : 'tagall'}
╰───────────────

╭─❑ 「 *${lenguajeGB.smsMenuTotal10()}* 」 ❑──
│ ➜ on
│ ➜ off
╰───────────────

╭─❑ 「 *${lenguajeGB.smsMenuTotal11()}* 」 ❑──
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'verificar *nombre.edad*' : 'verify *name.age*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'anulareg *id de registro*' : 'unreg *id registration*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'idregistro' : 'idregister'}
╰───────────────

╭─❑ 「 *${lenguajeGB.smsMenuTotal12()}* 」 ❑──
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'respaldo' : 'backup'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'banusuario *@tag*' : 'banuser *@tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desbanusuario *@tag*' : 'unbanuser *@tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'tenerpoder' : 'autoadmin'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevabiobot *texto*' : 'setbiobot *text*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevonombrebot *texto*' : 'setnamebot *text*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'nuevafotobot *imagen*' : 'setppbot *image*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'actualizar' : 'update'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'banearchat' : 'banchat'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desbanearchat' : 'unbanchat'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'salir' : 'leave'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bloquear *@tag*' : 'block *@tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'desbloquear *@tag*' : 'unblock *@tag*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'obtenercodigo *nombre de archivo*' : 'getplugin *filename*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'borrardatos *número*' : 'deletedatauser *number*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'unete *enlace*' : 'join *link*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bcsubbot *texto*' : 'bcsubbot *text*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bcc *texto*' : 'bcchats *text*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bcgc *texto*' : 'broadcastgc *text*'}
│ ➜ ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'bc *texto*' : 'broadcastall *text*'}
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
