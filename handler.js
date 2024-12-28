/*
   =======================================
   handler.js - Sin sintaxis catch "rara"
   =======================================
*/
import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import chalk from 'chalk'
import { unwatchFile, watchFile } from 'fs'

const { proto } = (await import('@adiwajshing/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
  if (!chatUpdate?.messages || !Array.isArray(chatUpdate.messages) || !chatUpdate.messages.length) {
    return
  }

  this.msgqueque = this.msgqueque || []
  try {
    await this.pushMessage(chatUpdate.messages)
  } catch (err) {
    console.error(err)
  }

  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (!global.db.data) {
    await global.loadDatabase()
  }

  m = smsg(this, m) || m
  if (!m) return

  m.exp = 0
  m.limit = false

  try {
    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') {
      global.db.data.users[m.sender] = {}
      user = global.db.data.users[m.sender]
    }
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
    if (!('detect' in chat)) chat.detect = false
    if (!('delete' in chat)) chat.delete = true
    if (!('antiLink' in chat)) chat.antiLink = true
    if (!('viewonce' in chat)) chat.viewonce = true
    if (!isNumber(chat.expired)) chat.expired = 0

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

  if (opts['nyimak']) return
  if (!m.fromMe && opts['self']) return
  if (opts['pconly'] && m.chat.endsWith('g.us')) return
  if (opts['gconly'] && !m.chat.endsWith('g.us')) return
  if (opts['owneronly'] && !m.chat.startsWith(`${global.nomorown}`)) return
  if (opts['swonly'] && m.chat !== 'status@broadcast') return
  if (typeof m.text !== 'string') m.text = ''

  if (!global.owner || !Array.isArray(global.owner)) {
    global.owner = []
  }

  const isROwner = [
    this.decodeJid(global.conn?.user?.id || ''),
    ...global.owner.map(([number]) => number)
  ]
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .includes(m.sender)

  const isOwner = isROwner
  const isMods = isOwner || (global.mods || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  const isPrems = isROwner || global.db.data.users[m.sender]?.premiumTime > 0

  if (opts['queque'] && m.text && !(isMods || isPrems)) {
    let queque = this.msgqueque, time = 5000
    const previousID = queque[queque.length - 1]
    queque.push(m.id || m.key.id)
    setInterval(async function () {
      if (queque.indexOf(previousID) === -1) clearInterval(this)
      await delay(time)
    }, time)
  }

  if (m.isBaileys) return
  m.exp += Math.ceil(Math.random() * 10)

  let usedPrefix
  const groupMetadata = (m.isGroup
    ? ((this.chats[m.chat] || {}).metadata || (await this.groupMetadata(m.chat).catch(_ => null)))
    : {}) || {}
  const participants = (m.isGroup ? groupMetadata.participants : []) || []
  const user = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {}
  const bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {}
  const isRAdmin = user?.admin === 'superadmin'
  const isAdmin = isRAdmin || user?.admin === 'admin'
  const isBotAdmin = bot?.admin

  const pluginFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'plugins')

  try {
    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin) continue
      if (plugin.disabled) continue

      const __filename = join(pluginFolder, name)

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

      if (!opts['restrict'] && plugin.tags?.includes('admin')) {
        continue
      }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix
        ? plugin.customPrefix
        : this.prefix
        ? this.prefix
        : global.prefix

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
        ) continue
      }
      if (typeof plugin !== 'function') continue
      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '')
        let [command, ...args] = noPrefix.trim().split(/\s+/)
        args = args || []
        let _args = noPrefix.trim().split(/\s+/).slice(1)
        let text = _args.join(' ')
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
          let usr = global.db.data.users[m.sender]
          if (
            name !== 'owner-unbanchat.js' &&
            name !== 'owner-exec.js' &&
            name !== 'owner-exec2.js' &&
            name !== 'tool-delete.js' &&
            chat?.isBanned
          ) {
            return
          }
          if (name !== 'owner-unbanuser.js' && usr?.banned) {
            return
          }
        }

        let adminMode = global.db.data.chats[m.chat]?.modoadmin
        if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin) {
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
        if (plugin.register && !global.db.data.users[m.sender]?.registered) {
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
            `Se acabaron tus coins. Usa *${usedPrefix}claimcoins* para tu recompensa diaria.\n\nO contacta a mi creador con *${usedPrefix}owner*`,
            m
          )
          continue
        }

        if (plugin.level > global.db.data.users[m.sender].level) {
          this.reply(
            m.chat,
            `✧ Necesitas nivel ${plugin.level} para usar este comando.\n*Tu nivel:* ${global.db.data.users[m.sender].level}`,
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
          if (!isPrems) {
            m.limit = m.limit || plugin.limit || false
          }
        } catch (e) {
          m.error = e
          console.error(e)
          if (e) {
            let txt = format(e)
            for (let key of Object.values(global.APIKeys || {})) {
              txt = txt.replace(new RegExp(key, 'g'), '#HIDDEN#')
            }
            if (e.name) {
              for (let [jid] of global.owner.filter(([num, _, dev]) => dev && num)) {
                let data = (await this.onWhatsApp(jid))[0] || {}
                if (data.exists) {
                  m.reply(
                    `*✧ Plugin:* ${m.plugin}\n*✧ Emisor:* ${m.sender}\n*✧ Chat:* ${m.chat}\n*✧ Comando:* ${usedPrefix}${command} ${args.join(' ')}\n✧ *Error:*\n\n\`\`\`${e}\`\`\``,
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
          if (m.limit) {
            m.reply(`Usaste ${m.limit} coin(s) ✧`)
          }
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
    let stats = global.db.data.stats
    if (m) {
      if (m.sender) {
        let user = global.db.data.users[m.sender]
        if (user) {
          user.exp += m.exp
          user.limit -= m.limit * 1
        }
      }
      if (m.plugin) {
        let now = +new Date()
        stats[m.plugin] = stats[m.plugin] || {}
        let stat = stats[m.plugin]
        if (!isNumber(stat.total)) stat.total = 1
        if (!isNumber(stat.success)) stat.success = m.error ? 0 : 1
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

export async function participantsUpdate({ id, participants, action }) {
  if (opts['self']) return
  if (this.isInit) return

  let chat = global.db.data.chats[id] || {}
  switch (action) {
    case 'add':
      if (chat.welcome) {
        let groupMetadata = (await this.groupMetadata(id).catch(_ => null)) || (this.chats[id] || {}).metadata || {}
        for (let user of participants) {
          try {
            // obtener foto, etc.
          } catch (e) {
            // ...
          } finally {
            let textp =
              (chat.sWelcome || this.welcome || 'Bienvenido, @user!')
                .replace('@subject', groupMetadata.subject || 'Grupo')
                .replace('@desc', groupMetadata.desc?.toString() || '')
                .replace('@user', this.getName(user))
            let linkimgk = chat.sWelcomeImageLink || 'https://d.uguu.se/mYSkSZPR.jpg'
            this.sendFile(id, linkimgk, '', textp)
          }
        }
      }
      break
  }
}

export async function groupsUpdate(groupsUpdate) {
  if (opts['self']) return
  for (let groupUpdate of groupsUpdate) {
    const id = groupUpdate.id
    if (!id) continue
    let chat = global.db.data.chats[id]
    if (!chat?.detect) continue
    let text = ''
    if (groupUpdate.desc) {
      text = (chat.sDesc || this.sDesc || 'Descripción => @desc').replace('@desc', groupUpdate.desc)
    }
    if (groupUpdate.subject) {
      text = (chat.sSubject || this.sSubject || 'Nombre => @subject').replace('@subject', groupUpdate.subject)
    }
    if (groupUpdate.icon) {
      text = (chat.sIcon || this.sIcon || 'Icono actualizado')
    }
    if (groupUpdate.revoke) {
      text = (chat.sRevoke || this.sRevoke || 'Link => @revoke').replace('@revoke', groupUpdate.revoke)
    }
    if (text) {
      await this.sendMessage(id, { text, mentions: this.parseMention(text) })
    }
  }
}

export async function deleteUpdate(message) {
  try {
    const { fromMe, id, participant } = message
    if (fromMe) return
    let msg = this.serializeM(this.loadMessage(id))
    if (!msg) return
    let chat = global.db.data.chats[msg.chat] || {}
    if (chat.delete) return
    this.reply(
      msg.chat,
      `@${participant?.split('@')[0]} eliminó un mensaje.
Para desactivar esta función: *.on delete*
Para eliminar mensajes del bot: *.delete*`,
      msg
    )
    this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
  } catch (e) {
    console.error(e)
  }
}

global.dfail = (type, m, conn) => {
  let msg = {
    rowner: '> _*Lo siento, este comando es solo para el Real Owner*_',
    owner: '> _*Lo siento, este comando es solo para mi Creador*_',
    mods: '> _*Lo siento, este comando es solo para Mods*_',
    premium: '> _*No eres Premium, contacta al Owner*_',
    group: '> _*Este comando solo funciona en grupos*_',
    private: '> _*Este comando solo funciona en chat privado*_',
    admin: '> _*Necesitas ser admin*_',
    botAdmin: '> _*Necesito ser admin primero*_',
    unreg: '> _*No estás registrado, usa .reg*_',
    restrict: '> _*Comando desactivado por Owner*_'
  }[type]
  if (msg) return conn.reply(m.chat, msg, m)
}

// Observamos cambios en handler.js
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'handler.js'"))
  if (global.reloadHandler) {
    console.log(await global.reloadHandler())
  }
})


