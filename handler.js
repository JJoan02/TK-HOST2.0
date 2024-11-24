// =======================================
// IMPORTS Y DEPENDENCIAS
// =======================================
import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile, readFileSync } from 'fs';
import chalk from 'chalk';
import fetch from 'node-fetch';
import pkg from '@adiwajshing/baileys';

const { proto } = pkg.default;

// =======================================
// VARIABLES Y CONSTANTES GLOBALES
// =======================================
const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms));

// =======================================
// FUNCIONES UTILITARIAS
// =======================================

/**
 * Aplica un estilo al texto dado según el estilo especificado.
 * @param {string} text - El texto a estilizar.
 * @param {number} style - El estilo a aplicar.
 * @returns {string} - El texto estilizado.
 */
const estilo = (text, style = 1) => {
  const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  const yStr = Object.freeze({
    1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
  });
  const replacer = xStr.map((v, i) => ({
    original: v,
    convert: yStr[style].split('')[i]
  }));
  return text.toLowerCase().split('').map(v => {
    const find = replacer.find(x => x.original == v);
    return find ? find.convert : v;
  }).join('');
};

/**
 * Obtiene una imagen de bienvenida aleatoria.
 * @returns {string} - URL de la imagen de bienvenida.
 */
function getRandomWelcomeImage() {
  const links = [
    'https://pomf2.lain.la/f/onvv8i5b.jpg',
    'https://pomf2.lain.la/f/ucogaqax.jpg',
    'https://pomf2.lain.la/f/m1z5y7ju.jpg',
    'https://pomf2.lain.la/f/fqeogyqi.jpg'
  ];
  return links[Math.floor(Math.random() * links.length)];
}

/**
 * Notifica a los desarrolladores sobre un error ocurrido.
 * @param {Error} error - El error ocurrido.
 * @param {string} pluginName - El nombre del plugin donde ocurrió el error.
 * @param {Object} message - El mensaje que provocó el error.
 * @param {string} usedPrefix - El prefijo usado.
 * @param {string} command - El comando ejecutado.
 * @param {Array} args - Los argumentos del comando.
 */
function notifyDevelopers(error, pluginName, message, usedPrefix = '', command = '', args = []) {
  const developers = global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number);
  developers.forEach(async ([number]) => {
    let data = (await conn.onWhatsApp(number))[0] || {};
    if (data.exists) {
      let errorMsg = `*✧ Plugin:* ${pluginName}\n*✧ Emisor:* ${message.sender}\n*✧ Chat:* ${message.chat}\n*✧ Comando:* ${usedPrefix}${command} ${args.join(' ')}\n✧ *Error Logs:*\n\n\`\`\`${error}\`\`\``.trim();
      message.reply(errorMsg, data.jid);
    }
  });
}

// =======================================
// FUNCIÓN PRINCIPAL DEL HANDLER
// =======================================

/**
 * Handler principal que procesa los mensajes entrantes.
 * @param {Object} chatUpdate - La actualización del chat.
 */
export async function handler(chatUpdate) {
  this.msgqueue = this.msgqueue || [];
  if (!chatUpdate) return;
  this.pushMessage(chatUpdate.messages).catch(console.error);

  let m = chatUpdate.messages[chatUpdate.messages.length - 1];
  if (!m) return;
  if (global.db.data == null) await global.loadDatabase();

  try {
    m = smsg(this, m) || m;
    if (!m) return;
    m.exp = 0;
    m.limit = false;

    // Verificar si el mensaje es de un grupo
    if (!m.isGroup) {
      // Ignorar mensajes que no sean de grupos
      return;
    }

    // =======================================
    // INICIALIZACIÓN DE DATOS
    // =======================================
    try {
      // Datos del usuario
      let user = global.db.data.users[m.sender];
      if (typeof user !== 'object') global.db.data.users[m.sender] = {};
      if (user) {
        user.exp = isNumber(user.exp) ? user.exp : 0;
        user.limit = isNumber(user.limit) ? user.limit : 10;
        user.afk = isNumber(user.afk) ? user.afk : -1;
        user.afkReason = 'afkReason' in user ? user.afkReason : '';
        user.banned = 'banned' in user ? user.banned : false;
        user.banReason = 'banReason' in user ? user.banReason : '';
        user.role = 'role' in user ? user.role : 'Free user';
        user.autolevelup = 'autolevelup' in user ? user.autolevelup : false;
        user.bank = isNumber(user.bank) ? user.bank : 0;
      } else {
        global.db.data.users[m.sender] = {
          exp: 0,
          limit: 10,
          lastclaim: 0,
          registered: false,
          name: m.name,
          age: -1,
          regTime: -1,
          afk: -1,
          afkReason: '',
          banned: false,
          banReason: '',
          warn: 0,
          level: 0,
          role: 'Free user',
          autolevelup: false,
          bank: 0
        };
      }

      // Datos del chat
      let chat = global.db.data.chats[m.chat];
      if (typeof chat !== 'object') global.db.data.chats[m.chat] = {};
      if (chat) {
        chat.isBanned = 'isBanned' in chat ? chat.isBanned : false;
        chat.welcome = 'welcome' in chat ? chat.welcome : true;
        chat.autodl = 'autodl' in chat ? chat.autodl : false;
        chat.detect = 'detect' in chat ? chat.detect : false;
        chat.sWelcome = 'sWelcome' in chat ? chat.sWelcome : '';
        chat.sByeImageLink = 'sByeImageLink' in chat ? chat.sByeImageLink : 'https://d.uguu.se/mYSkSZPR.jpg';
        chat.sWelcomeImageLink = 'sWelcomeImageLink' in chat ? chat.sWelcomeImageLink : getRandomWelcomeImage();
        chat.sBye = 'sBye' in chat ? chat.sBye : '';
        chat.sPromote = 'sPromote' in chat ? chat.sPromote : '';
        chat.sDemote = 'sDemote' in chat ? chat.sDemote : '';
        chat.delete = 'delete' in chat ? chat.delete : true;
        chat.antiLink = 'antiLink' in chat ? chat.antiLink : true;
        chat.viewonce = 'viewonce' in chat ? chat.viewonce : true;
        chat.antiToxic = 'antiToxic' in chat ? chat.antiToxic : false;
        chat.simi = 'simi' in chat ? chat.simi : false;
        chat.chatgpt = 'chatgpt' in chat ? chat.chatgpt : false;
        chat.autoSticker = 'autoSticker' in chat ? chat.autoSticker : false;
        chat.premium = 'premium' in chat ? chat.premium : false;
        chat.premiumTime = 'premiumTime' in chat ? chat.premiumTime : false;
        chat.nsfw = 'nsfw' in chat ? chat.nsfw : true;
        chat.menu = 'menu' in chat ? chat.menu : true;
        chat.expired = isNumber(chat.expired) ? chat.expired : 0;
        chat.modoadmin = 'modoadmin' in chat ? chat.modoadmin : false;
        chat.antiLinkHttp = 'antiLinkHttp' in chat ? chat.antiLinkHttp : true;
        chat.antiLinkWaChannel = 'antiLinkWaChannel' in chat ? chat.antiLinkWaChannel : true;
      } else {
        global.db.data.chats[m.chat] = {
          isBanned: false,
          welcome: true,
          antiLinkWaChannel: true,
          antiLinkHttp: true,
          modoadmin: false,
          autodl: false,
          detect: false,
          sWelcome: '',
          sBye: '',
          sWelcomeImageLink: getRandomWelcomeImage(),
          sPromote: '',
          sDemote: '',
          delete: true,
          antiLink: true,
          viewonce: true,
          simi: false,
          chatgpt: false,
          expired: 0,
          autoSticker: false,
          premium: false,
          premiumTime: false,
          nsfw: true,
          menu: true
        };
      }

      // Configuración global
      let settings = global.db.data.settings[this.user.jid];
      if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {};
      if (settings) {
        settings.self = 'self' in settings ? settings.self : true;
        settings.autoread = 'autoread' in settings ? settings.autoread : true;
        settings.restrict = 'restrict' in settings ? settings.restrict : true;
        settings.anticall = 'anticall' in settings ? settings.anticall : true;
        settings.antiPrivate = 'antiPrivate' in settings ? settings.antiPrivate : true;
        settings.restartDB = 'restartDB' in settings ? settings.restartDB : 0;
      } else {
        global.db.data.settings[this.user.jid] = {
          antiPrivate: true,
          self: true,
          autoread: true,
          anticall: true,
          restartDB: 0,
          restrict: true
        };
      }
    } catch (e) {
      console.error(e);
    }

    // =======================================
    // VALIDACIONES Y OPCIONES
    // =======================================
    if (opts['nyimak']) return;
    if (!m.fromMe && opts['self']) return;
    if (opts['pconly'] && m.chat.endsWith('g.us')) return;
    if (opts['gconly'] && !m.chat.endsWith('g.us')) return;
    if (opts['owneronly'] && !m.chat.startsWith(`${global.nomorown}`)) return;
    if (opts['swonly'] && m.chat !== 'status@broadcast') return;
    if (typeof m.text !== 'string') m.text = '';

    // =======================================
    // ROLES Y PERMISOS
    // =======================================
    const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
    const isOwner = isROwner;
    const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
    const isPrems = isROwner || db.data.users[m.sender].premiumTime > 0;

    if (!isOwner && opts['self']) return;
    if (opts['queue'] && m.text && !(isMods || isPrems)) {
      let queue = this.msgqueue, time = 1000 * 5;
      const previousID = queue[queue.length - 1];
      queue.push(m.id || m.key.id);
      setInterval(async function () {
        if (queue.indexOf(previousID) === -1) clearInterval(this);
        await delay(time);
      }, time);
    }

    if (m.isBaileys) return;
    m.exp += Math.ceil(Math.random() * 10);

    // =======================================
    // PROCESAMIENTO DEL MENSAJE
    // =======================================
    let usedPrefix;
    const _user = global.db.data && global.db.data.users && global.db.data.users[m.sender];
    const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {};
    const participants = (m.isGroup ? groupMetadata.participants : []) || [];
    const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {};
    const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {};
    const isRAdmin = user?.admin == 'superadmin' || false;
    const isAdmin = isRAdmin || user?.admin == 'admin' || false;
    const isBotAdmin = bot?.admin || false;

    const pluginsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
    for (let name in global.plugins) {
      let plugin = global.plugins[name];
      if (!plugin || plugin.disabled) continue;
      const pluginPath = join(pluginsDir, name);

      // Ejecutar función 'all' si existe
      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: pluginsDir,
            __filename: pluginPath
          });
        } catch (e) {
          console.error(e);
          notifyDevelopers(e, name, m);
        }
      }

      // Saltar si el plugin requiere permisos restringidos
      if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) {
        continue;
      }

      // Manejo de prefijos y comandos
      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;
      let match = (_prefix instanceof RegExp ?
        [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ?
          _prefix.map(p => {
            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
            return [re.exec(m.text), re];
          }) :
          typeof _prefix === 'string' ?
            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
            [[[], new RegExp]]
      ).find(p => p[1]);

      // Ejecutar función 'before' si existe
      if (typeof plugin.before === 'function') {
        if (await plugin.before.call(this, m, {
          match,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: pluginsDir,
          __filename: pluginPath
        })) continue;
      }

      if (typeof plugin !== 'function') continue;

      // Verificar si el mensaje coincide con el comando del plugin
      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '');
        let [command, ...args] = noPrefix.trim().split(/\s+/);
        args = args || [];
        let _args = noPrefix.trim().split(/\s+/).slice(1);
        let text = _args.join(' ');
        command = (command || '').toLowerCase();
        let fail = plugin.fail || global.dfail;

        let isAccept = plugin.command instanceof RegExp ?
          plugin.command.test(command) :
          Array.isArray(plugin.command) ?
            plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
            typeof plugin.command === 'string' ?
              plugin.command === command :
              false;

        if (!isAccept) continue;

        m.plugin = name;

        // Verificar si el usuario o chat están baneados
        if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
          let chat = global.db.data.chats[m.chat];
          let user = global.db.data.users[m.sender];
          if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && chat?.isBanned) return;
          if (name != 'owner-unbanuser.js' && user?.banned) return;
        }

        // Modo admin
        let hl = _prefix;
        let adminMode = global.db.data.chats[m.chat].modoadmin;
        let isCommand = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl || m.text.slice(0, 1) == hl || plugin.command}`;
        if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && isCommand) return;

        // Verificaciones de permisos
        if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
          fail('owner', m, this);
          continue;
        }
        if (plugin.rowner && !isROwner) {
          fail('rowner', m, this);
          continue;
        }
        if (plugin.owner && !isOwner) {
          fail('owner', m, this);
          continue;
        }
        if (plugin.mods && !isMods) {
          fail('mods', m, this);
          continue;
        }
        if (plugin.premium && !isPrems) {
          fail('premium', m, this);
          continue;
        }
        if (plugin.group && !m.isGroup) {
          fail('group', m, this);
          continue;
        } else if (plugin.botAdmin && !isBotAdmin) {
          fail('botAdmin', m, this);
          continue;
        } else if (plugin.admin && !isAdmin) {
          fail('admin', m, this);
          continue;
        }
        if (plugin.private && m.isGroup) {
          fail('private', m, this);
          continue;
        }
        if (plugin.register == true && _user.registered == false) {
          fail('unreg', m, this);
          continue;
        }

        m.isCommand = true;
        let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17;
        if (xp > 200) m.reply('-_-');
        else m.exp += xp;

        if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
          this.reply(m.chat, `Tus coins se acabaron, usa *${usedPrefix}claimcoins* para tu recompensa diaria\n\no\nHabla con mi creador para obtener premium *${usedPrefix}owner*`, m);
          continue;
        }

        if (plugin.level > _user.level) {
          this.reply(m.chat, `✧ Necesitas estar en el nivel ${plugin.level} para usar este comando.\n*✧ Tu nivel actualmente:* ${_user.level} 📊`, m);
          continue;
        }

        let extra = {
          match,
          usedPrefix,
          noPrefix,
          _args,
          args,
          command,
          text,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: pluginsDir,
          __filename: pluginPath
        };

        // Ejecutar el plugin
        try {
          await plugin.call(this, m, extra);
          if (!isPrems) m.limit = m.limit || plugin.limit || false;
        } catch (e) {
          m.error = e;
          console.error(e);
          notifyDevelopers(e, name, m, usedPrefix, command, args);
        } finally {
          if (typeof plugin.after === 'function') {
            try {
              await plugin.after.call(this, m, extra);
            } catch (e) {
              console.error(e);
            }
          }
          if (m.limit) m.reply(`${m.limit} coins usado ✧ `);
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    // =======================================
    // ACTUALIZACIÓN DE DATOS Y ESTADÍSTICAS
    // =======================================
    if (opts['queue'] && m.text) {
      const queueIndex = this.msgqueue.indexOf(m.id || m.key.id);
      if (queueIndex !== -1) this.msgqueue.splice(queueIndex, 1);
    }

    let user, stats = global.db.data.stats;
    if (m) {
      if (m.sender && (user = global.db.data.users[m.sender])) {
        user.exp += m.exp;
        user.limit -= m.limit * 1;
      }
      let stat;
      if (m.plugin) {
        let now = +new Date();
        if (m.plugin in stats) {
          stat = stats[m.plugin];
          stat.total = isNumber(stat.total) ? stat.total : 1;
          stat.success = isNumber(stat.success) ? stat.success : (m.error != null ? 0 : 1);
          stat.last = isNumber(stat.last) ? stat.last : now;
          stat.lastSuccess = isNumber(stat.lastSuccess) ? stat.lastSuccess : (m.error != null ? 0 : now);
        } else {
          stat = stats[m.plugin] = {
            total: 1,
            success: m.error != null ? 0 : 1,
            last: now,
            lastSuccess: m.error != null ? 0 : now
          };
        }
        stat.total += 1;
        stat.last = now;
        if (m.error == null) {
          stat.success += 1;
          stat.lastSuccess = now;
        }
      }
    }

    try {
      if (!opts['noprint']) await (await import('./lib/print.js')).default(m, this);
    } catch (e) {
      console.log(m, m.quoted, e);
    }

    if (opts['autoread']) await conn.readMessages([m.key]);
  }
}

// =======================================
// MANEJADORES DE EVENTOS
// =======================================

/**
 * Maneja las actualizaciones de participantes en grupos.
 * @param {Object} update - La actualización de participantes.
 */
export async function participantsUpdate({ id, participants, action }) {
  if (opts['self']) return;
  if (this.isInit) return;

  let chat = global.db.data.chats[id] || {};
  if (!chat.welcome) return;

  let groupMetadata = await this.groupMetadata(id) || (this.chats[id] || {}).metadata;
  for (let user of participants) {
    try {
      let pp = 'https://telegra.ph/file/3067b920347facbb69bb1.jpg'; // Foto de perfil predeterminada
      // Puedes obtener la foto de perfil real aquí si lo deseas
    } catch (e) {
      console.error(e);
    } finally {
      let text = '';
      let imageLink = '';
      if (action === 'add') {
        text = (chat.sWelcome || this.welcome || await Connection.conn.welcome || 'Bienvenido, @user!').replace('@subject', await this.getName(id)).replace('@desc', groupMetadata.desc?.toString() || 'unknown').replace('@user', this.getName(user));
        imageLink = chat.sWelcomeImageLink || 'https://d.uguu.se/mYSkSZPR.jpg';
      } else if (action === 'remove') {
        text = (chat.sBye || this.bye || await Connection.conn.bye || 'Bye bye, @user!').replace('@user', this.getName(user));
        imageLink = chat.sByeImageLink || 'https://d.uguu.se/mYSkSZPR.jpg';
      }

      await this.sendFile(id, imageLink, '', text);
    }
  }
}

/**
 * Maneja las actualizaciones de grupos.
 * @param {Array} groupsUpdate - Las actualizaciones de los grupos.
 */
export async function groupsUpdate(groupsUpdate) {
  if (opts['self']) return;

  for (const groupUpdate of groupsUpdate) {
    const id = groupUpdate.id;
    if (!id) continue;

    let chats = global.db.data.chats[id];
    if (!chats?.detect) continue;

    let text = '';
    if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || await Connection.conn.sDesc || '```La descripción ha sido cambiada a```\n@desc').replace('@desc', groupUpdate.desc);
    if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || await Connection.conn.sSubject || '```El nombre del grupo ha sido cambiado a```\n@subject').replace('@subject', groupUpdate.subject);
    if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || await Connection.conn.sIcon || '```El icono ha sido cambiado```');
    if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || await Connection.conn.sRevoke || '```El enlace del grupo ha sido actualizado```\n@revoke').replace('@revoke', groupUpdate.revoke);
    if (!text) continue;

    await this.sendMessage(id, { text, mentions: this.parseMe
ntion(text) });
  }
}

/**
 * Maneja la eliminación de mensajes.
 * @param {Object} message - El mensaje eliminado.
 */
export async function deleteUpdate(message) {
  try {
    const { fromMe, id, participant } = message;
    if (fromMe) return;

    let msg = this.serializeM(this.loadMessage(id));
    if (!msg) return;

    let chat = global.db.data.chats[msg.chat] || {};
    if (chat.delete) return;

    this.reply(msg.chat, `
@${participant.split`@`[0]} eliminó un mensaje.
*✧ Para desactivar esta función escribe:*
*.on delete*

*✧ Para eliminar los mensajes del bot escribe:*
*.delete*`, msg);
    this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg));
  } catch (e) {
    console.error(e);
  }
}


// =======================================
// MANEJO DE ERRORES
// =======================================

/**
 * Maneja los errores y mensajes de rechazo.
 * @param {string} type - El tipo de error.
 * @param {Object} m - El mensaje.
 * @param {Object} conn - La conexión.
 */
global.dfail = (type, m, conn) => {
  let msg = {
    rowner: '> _*✧ Perdón, este comando es solo para mi Owner.*_',
    owner: '> _*✧ Perdón, solo mi creador puede usar este comando.*_',
    mods: '> _*✧ Perdón, este comando solo es para mods*_',
    premium: '> _*✧ No eres un usuario Premium, habla con mi owner*_',
    group: '> _*✧ Perdón, este comando solo es para grupos*_',
    private: '> _*✧ Ve a mi chat privado y usa este comando*_',
    admin: '> _*✧ ¿Quién eres?, tú no eres admin*_',
    botAdmin: '> _*✧ Es necesario que sea admin primero para usar esta función*_',
    unreg: '> _*‼️ USUARIO NO REGISTRADO ‼️*_\n\n`Para registrarse:`\n\n> usa el comando .reg',
    restrict: '> _*✧ Comando desactivado por mi Owner*_*'
  }[type];

  let deco_msg = "`ׅㅤ ⵿͝ ፝֟͜口֟፝͜ ͝ ⵿࿙࿚ ⚠️  Admin TK ⚠️ ࿙࿚⵿۫ ͝ ፝֟͜口፝֟͜ ⵿͝*`\n" + `${msg}\n` + "`︶ִֶָ⏝︶ִֶָ⏝˖ ࣪ ୨✧୧ ࣪ ˖⏝ִֶָ︶⏝ִֶָ︶`";
  if (msg) return conn.reply(m.chat, estilo(deco_msg), m);
};

// =======================================
// WATCH FILE PARA ACTUALIZACIONES
// =======================================

let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
  unwatchFile(file);
  console.log(chalk.redBright("Actualización 'handler.js'"));
  if (global.reloadHandler) console.log(await global.reloadHandler());
});
