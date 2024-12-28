import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@adiwajshing/baileys')).default

// Comprueba si un valor es número
const isNumber = x => typeof x === 'number' && !isNaN(x)
// Pequeña función de delay
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

/**
 * Handler principal de mensajes
 */
export async function handler(chatUpdate) {
  // Verificamos que 'chatUpdate.messages' exista y sea un array con al menos 1 elemento
  if (!chatUpdate || !chatUpdate.messages || !Array.isArray(chatUpdate.messages) || !chatUpdate.messages.length) {
    return
  }

  // Intentar pushMessage
  this.msgqueque = this.msgqueque || []
  try {
    await this.pushMessage(chatUpdate.messages)
  } catch (err) {
    console.error(err)
  }

  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) {
    await global.loadDatabase()
  }

  // smsg => simplifica un proto de Baileys
  m = smsg(this, m) || m
  if (!m) return

  m.exp = 0
  m.limit = false

  // Manejo de DB para usuarios, chats, etc.
  try {
    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') {
      global.db.data.users[m.sender] = {}
      user = global.db.data.users[m.sender]
    }
    // Ajustes base
    if (!isNumber(user.exp)) user.exp = 0
    if (!isNumber(user.limit)) user.limit = 10
    if (!isNumber(user.afk)) user.afk = -1
    if (!('afkReason' in user)) user.afkReason = ''
    if (!('banned' in user)) user.banned = false
    if (!('banReason' in user)) user.banReason = ''
    if (!('role' in user)) user.role = 'Free user'
    if (!('autolevelup' in user)) user.autolevelup = false
    if (!isNumber(user.bank)) user.bank = 0

    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') {
      global.db.data.chats[m.chat] = {}
      chat = global.db.data.chats[m.chat]
    }
    if (!('isBanned' in chat)) chat.isBanned = false
    if (!('welcome' in chat)) chat.welcome = true
    if (!('bienvenida' in chat)) chat.bienvenida = true
    if (!('autodl' in chat)) chat.autodl = false
    if (!('detect' in chat)) chat.detect = false
    if (!('sWelcome' in chat)) chat.sWelcome = ''
    if (!('sPromote' in chat)) chat.sPromote = ''
    if (!('sDemote' in chat)) chat.sDemote = ''
    if (!('delete' in chat)) chat.delete = true
    if (!('antiLink' in chat)) chat.antiLink = true
    if (!('viewonce' in chat)) chat.viewonce = true
    if (!('antiToxic' in chat)) chat.antiToxic = false
    if (!('simi' in chat)) chat.simi = false
    if (!('chatgpt' in chat)) chat.chatgpt = false
    if (!('autoSticker' in chat)) chat.autoSticker = false
    if (!('premium' in chat)) chat.premium = false
    if (!('premiumTime' in chat)) chat.premiumTime = false
    if (!('nsfw' in chat)) chat.nsfw = true
    if (!('menu' in chat)) chat.menu = true
    if (!isNumber(chat.expired)) chat.expired = 0
    if (!('modoadmin' in chat)) chat.modoadmin = false
    if (!('antiLinkHttp' in chat)) chat.antiLinkHttp = true
    if (!('antiLinkWaChannel' in chat)) chat.antiLinkWaChannel = true

    let settings = global.db.data.settings[this.user.jid]
    if (typeof settings !== 'object') {
      global.db.data.settings[this.user.jid] = {}
      settings = global.db.data.settings[this.user.jid]
    }
    if (!('self' in settings)) settings.self = true
    if (!('autoread' in settings)) settings.autoread = true
    if (!('restrict' in settings)) settings.restrict = true
    if (!('anticall' in settings)) settings.anticall = true
    if (!('antiPrivate' in settings)) settings.antiPrivate = true
    if (!('restartDB' in settings)) settings.restartDB = 0
  } catch (e) {
    console.error(e)
  }

  // Revisa flags
  if (opts['nyimak']) return
  if (!m.fromMe && opts['self']) return
  if (opts['pconly'] && m.chat.endsWith('g.us')) return
  if (opts['gconly'] && !m.chat.endsWith('g.us')) return
  if (opts['owneronly'] && !m.chat.startsWith(`${global.nomorown}`)) return
  if (opts['swonly'] && m.chat !== 'status@broadcast') return

  if (typeof m.text !== 'string') m.text = ''

  // FIX: si no hay global.owner, definimos array vacío:
  if (!global.owner || !Array.isArray(global.owner)) {
    global.owner = []
  }

  // isROwner
  const isROwner = [
    this.decodeJid(global.conn?.user?.id || ''),
    ...global.owner.map(([number]) => number)
  ]
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .includes(m.sender)

  const isOwner = isROwner
  const isMods = isOwner || (global.mods || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  const isPrems = isROwner || global.db.data.users[m.sender]?.premiumTime > 0

  // Ejemplo
  if (opts['queque'] && m.text && !(isMods || isPrems)) {
    let queque = this.msgqueque, time = 1000 * 5
    const previousID = queque[queque.length - 1]
    queque.push(m.id || m.key.id)
    setInterval(async function () {
      if (queque.indexOf(previousID) === -1) clearInterval(this)
      await delay(time)
    }, time)
  }

  if (m.isBaileys) return

  // Ganar algo de XP
  m.exp += Math.ceil(Math.random() * 10)

  // Lógica principal de comandos
  let usedPrefix
  const _user = global.db.data.users[m.sender]
  const groupMetadata = (m.isGroup
    ? ((this.chats[m.chat] || {}).metadata ||
      (await this.groupMetadata(m.chat).catch(_ => null)))
    : {}) || {}
  const participants = (m.isGroup ? groupMetadata.participants : []) || []
  const user = (
    m.isGroup
      ? participants.find(u => this.decodeJid(u.id) === m.sender)
      : {}
  ) || {}
  const bot = (
    m.isGroup
      ? participants.find(u => this.decodeJid(u.id) == this.user.jid)
      : {}
  ) || {}
  const isRAdmin = user?.admin === 'superadmin' || false
  const isAdmin = isRAdmin || user?.admin === 'admin' || false
  const isBotAdmin = bot?.admin || false

  const pluginFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
  for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin) continue
    if (plugin.disabled) continue

    // Path del plugin
    const __filename = join(pluginFolder, name)

    // Ejecuta la función all() si existe
    if (typeof plugin.all === 'function') {
      try {
        await plugin.all.call(this, m, {
          chatUpdate,
          __dirname: pluginFolder,
          __filename
        })
      } catch (e) {
        console.error(e)
        for (let [jid] of global.owner.filter(([num, _, dev]) => dev && num)) {
          let data = (await this.onWhatsApp(jid))[0] || {}
          if (data.exists) {
            m.reply(
              `*Plugin:* ${name}\n*Emisor:* ${m.sender}\n*Chat:* ${m.chat}\n*Comando:* ${m.text}\n\n\`\`\`${format(e)}\`\`\``,
              data.jid
            )
          }
        }
      }
    }

    if (!opts['restrict']) {
      if (plugin.tags && plugin.tags.includes('admin')) {
        // Comando de admin bloqueado
        continue
      }
    }

    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    let _prefix = plugin.customPrefix
      ? plugin.customPrefix
      : this.prefix
        ? this.prefix
        : global.prefix

    // Generar array de matches
    let match = (
      _prefix instanceof RegExp
        ? [[_prefix.exec(m.text), _prefix]]
        : Array.isArray(_prefix)
        ? _prefix.map(p => {
            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
            return [re.exec(m.text), re]
          })
        : typeof _prefix === 'string'
        ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
        : [[[], new RegExp]]
    ).find(p => p[1])

    if (typeof plugin.before === 'function') {
      if (
        await plugin.before.call(this, m, {
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
          __dirname: pluginFolder,
          __filename
        })
      )
        continue
    }
    if (typeof plugin !== 'function') continue
    if ((usedPrefix = (match[0] || '')[0])) {
      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
      args = args || []
      let _args = noPrefix.trim().split` `.slice(1)
      let text = _args.join` `
      command = (command || '').toLowerCase()
      let fail = plugin.fail || global.dfail
      let isAccept = plugin.command instanceof RegExp
        ? plugin.command.test(command)
        : Array.isArray(plugin.command)
        ? plugin.command.some(cmd =>
            cmd instanceof RegExp ? cmd.test(command) : cmd === command
          )
        : typeof plugin.command === 'string'
        ? plugin.command === command
        : false

      if (!isAccept) continue

      m.plugin = name
      if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
        let chat = global.db.data.chats[m.chat]
        let user = global.db.data.users[m.sender]
        if (
          name !== 'owner-unbanchat.js' &&
          name !== 'owner-exec.js' &&
          name !== 'owner-exec2.js' &&
          name !== 'tool-delete.js' &&
          chat?.isBanned
        ) {
          return
        }
        if (name !== 'owner-unbanuser.js' && user?.banned) {
          return
        }
      }

      // "Modo admin"
      let hl = _prefix
      let adminMode = global.db.data.chats[m.chat].modoadmin
      let keni = `${
        plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl
      }`
      if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && keni) {
        return
      }

      if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
        fail('owner', m, this)
        continue
      }
      if (plugin.rowner && !isROwner) {
        fail('rowner', m, this)
        continue
      }
      if (plugin.owner && !isOwner) {
        fail('owner', m, this)
        continue
      }
      if (plugin.mods && !isMods) {
        fail('mods', m, this)
        continue
      }
      if (plugin.premium && !isPrems) {
        fail('premium', m, this)
        continue
      }
      if (plugin.group && !m.isGroup) {
        fail('group', m, this)
        continue
      } else if (plugin.botAdmin && !isBotAdmin) {
        fail('botAdmin', m, this)
        continue
      } else if (plugin.admin && !isAdmin) {
        fail('admin', m, this)
        continue
      }
      if (plugin.private && m.isGroup) {
        fail('private', m, this)
        continue
      }
      if (plugin.register === true && _user.registered === false) {
        fail('unreg', m, this)
        continue
      }

      m.isCommand = true
      let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
      if (xp > 200) m.reply('-_-')
      else m.exp += xp

      if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit) {
        this.reply(
          m.chat,
          `Se te acabaron las coins. Usa *${usedPrefix}claimcoins* para tu recompensa diaria.\n\nO contacta a mi creador para obtener premium *${usedPrefix}owner*`,
          m
        )
        continue
      }
      if (plugin.level > _user.level) {
        this.reply(
          m.chat,
          `✧ Necesitas el nivel ${plugin.level} para usar este comando.\n*✧ Tu nivel actual:* ${_user.level} 📊`,
          m
        )
        continue
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
        __dirname: pluginFolder,
        __filename
      }
      try {
        await plugin.call(this, m, extra)
        if (!isPrems) m.limit = m.limit || plugin.limit || false
      } catch (e) {
        m.error = e
        console.error(e)
        if (e) {
          let txt = format(e)
          for (let key of Object.values(global.APIKeys)) {
            txt = txt.replace(new RegExp(key, 'g'), '#HIDDEN#')
          }
          if (e.name) {
            for (let [jid] of global.owner.filter(([num, _, isDev]) => isDev && num)) {
              let data = (await this.onWhatsApp(jid))[0] || {}
              if (data.exists) {
                m.reply(
                  `*✧ Plugin:* ${m.plugin}\n*✧ Emisor:* ${m.sender}\n*✧ Chat:* ${m.chat}\n*✧ Comando:* ${usedPrefix}${command} ${args.join(' ')}\n✧ *Error Logs:*\n\n\`\`\`${e}\`\`\``,
                  data.jid
                )
              }
            }
          }
        }
      } finally {
        if (typeof plugin.after === 'function') {
          try {
            await plugin.after.call(this, m, extra)
          } catch (e) {
            console.error(e)
          }
        }
        if (m.limit) m.reply(`${m.limit} coins usado ✧`)
      }
      break
    }
  }
} catch (e) {
  console.error(e)
} finally {
  if (opts['queque'] && m.text) {
    const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
    if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
  }
  let user, stats = global.db.data.stats
  if (m) {
    if (m.sender && (user = global.db.data.users[m.sender])) {
      user.exp += m.exp
      user.limit -= m.limit * 1
    }
    let stat
    if (m.plugin) {
      let now = +new Date()
      stats[m.plugin] = stats[m.plugin] || {}
      stat = stats[m.plugin]
      if (!isNumber(stat.total)) stat.total = 1
      if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
      if (!isNumber(stat.last)) stat.last = now
      if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error ? 0 : now

      stat.total += 1
      stat.last = now
      if (!m.error) {
        stat.success += 1
        stat.lastSuccess = now
      }
    }
  }
  if (opts['autoread']) {
    await this.readMessages([m.key])
  }
}
}

/**
 * Handle groups participants update
 */
export async function participantsUpdate({ id, participants, action }) {
  if (opts['self']) return
  if (this.isInit) return
  let chat = global.db.data.chats[id] || {}
  switch (action) {
    case 'add':
      if (chat.welcome) {
        let groupMetadata = (await this.groupMetadata(id).catch(_ => null)) || (this.chats[id] || {}).metadata
        for (let user of participants) {
          try {
            // Podrías obtener la foto con .profilePictureUrl
            // Si da error, usas default
            let pp = 'https://telegra.ph/file/3067b920347facbb69bb1.jpg'
          } catch (e) {
            // ...
          } finally {
            let textp = (chat.sWelcome || this.welcome || 'Bienvenido, @user!')
              .replace('@subject', groupMetadata?.subject || 'Grupo')
              .replace('@desc', groupMetadata.desc?.toString() || 'Descripción no disponible')
              .replace('@user', this.getName(user))
            let linkimgk = chat.sWelcomeImageLink || 'https://d.uguu.se/mYSkSZPR.jpg'
            this.sendFile(id, linkimgk, '', textp)
          }
        }
      }
      break
  }
}

/**
 * Handle groups update
 */
export async function groupsUpdate(groupsUpdate) {
  if (opts['self']) return
  for (const groupUpdate of groupsUpdate) {
    const id = groupUpdate.id
    if (!id) continue
    let chats = global.db.data.chats[id],
      text = ''
    if (!chats?.detect) continue
    if (groupUpdate.desc) {
      text = (chats.sDesc || this.sDesc || 'Descripción actualizada a\n@desc').replace('@desc', groupUpdate.desc)
    }
    if (groupUpdate.subject) {
      text = (chats.sSubject || this.sSubject || 'Nombre de grupo cambiado a\n@subject').replace('@subject', groupUpdate.subject)
    }
    if (groupUpdate.icon) {
      text = (chats.sIcon || this.sIcon || 'Icono de grupo actualizado').replace('@icon', groupUpdate.icon)
    }
    if (groupUpdate.revoke) {
      text = (chats.sRevoke || this.sRevoke || 'Link de grupo actualizado:\n@revoke').replace('@revoke', groupUpdate.revoke)
    }
    if (!text) continue
    await this.sendMessage(id, { text, mentions: this.parseMention(text) })
  }
}

/**
 * Manejo de mensajes eliminados
 */
export async function deleteUpdate(message) {
  try {
    const { fromMe, id, participant } = message
    if (fromMe) return
    let msg = this.serializeM(this.loadMessage(id))
    if (!msg) return
    let chat = global.db.data.chats[msg.chat] || {}
    if (chat.delete) return // Si se permite borrar sin aviso
    this.reply(
      msg.chat,
      `@${participant?.split`@`[0]} eliminó un mensaje.
Para desactivar esta función: *.on delete*
Para eliminar mensajes del bot: *.delete*`,
      msg
    )
    this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
  } catch (e) {
    console.error(e)
  }
}

// Mensaje de error en caso de acceso denegado
global.dfail = (type, m, conn) => {
  let msg = {
    rowner: '> _*Solo el Real Owner puede usar este comando.*_',
    owner: '> _*Solo mi Creador puede usar este comando.*_',
    mods: '> _*Este comando solo es para moderadores*_',
    premium: '> _*No eres usuario Premium, contacta a mi owner*_',
    group: '> _*Este comando solo es para grupos*_',
    private: '> _*Este comando solo es para chat privado*_',
    admin: '> _*Necesitas ser admin para usar este comando*_',
    botAdmin: '> _*Necesito ser admin para usar esta función*_',
    unreg: '> _*No estás registrado, usa el comando .reg*_',
    restrict: '> _*Comando desactivado por el owner*_'
  }[type]
  if (msg) return conn.reply(m.chat, msg, m)
}

// Monitorear cambios en este archivo
import { watchFile, unwatchFile } from 'fs'
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})

