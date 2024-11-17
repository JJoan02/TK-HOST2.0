export async function before(m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;
  if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') || m.text.includes('serbot') || m.text.includes('jadibot')) return !0;
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};
  if (bot.antiPrivate && !isOwner && !isROwner) {
    //await m.reply('> _*`🤍 ʜᴏʟᴀ '+`@${m.sender.split`@`[0]}`+', ᴘᴇʀᴅᴏɴ ᴅᴇʙɪᴅᴏ ᴀ ǫᴜᴇ ᴍɪ ᴘʀᴏᴘɪᴇᴛᴀʀɪᴏ ᴀᴄᴛɪᴠᴏ ᴇʟ ᴀɴᴛɪᴘᴠ ɴᴏ ᴘᴜᴇᴅᴏ ʀᴇᴄɪʙɪʀ ᴍᴇɴsᴀᴊᴇs ᴀʟ ᴘʀɪᴠᴀᴅᴏ ʏ sᴇʀᴀs ʙʟᴏǫᴇᴜᴀᴅᴏ\n\n> _*`ᴘᴜᴇᴅᴇs ᴜɴɪʀᴛᴇ ᴀʟ ɢʀᴜᴘᴏ ᴅᴇʟ ʙᴏᴛ ʏ ᴜsᴀʀʟᴏ ʟɪʙʀᴇᴍᴇɴᴛᴇ ᴀʜɪ`*_ 👇\n\n\n'+gp1, false, {mentions: [m.sender]});
    await this.updateBlockStatus(m.chat, 'block');
  }
  return !1;
const comandos = /piedra|papel|tijera|estado|verificar|code|jadibot --code|--code|creadora|bottemporal|grupos|instalarbot|términos|bots|deletebot|eliminarsesion|serbot|verify|register|registrar|reg|reg1|nombre|name|nombre2|name2|edad|age|edad2|age2|genero|género|gender|identidad|pasatiempo|hobby|identify|finalizar|pas2|pas3|pas4|pas5|registroc|deletesesion|registror|jadibot/i;

let handler = m => m;
handler.before = async function (m, { conn, isOwner, isROwner }) {
    if (m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;

    const regexWithPrefix = new RegExp(`^${prefix.source}\\s?${comandos.source}`, 'i');
    if (regexWithPrefix.test(m.text.toLowerCase().trim())) return true;

    let chat, user, bot, mensaje;
    chat = global.db.data.chats[m.chat];
    user = global.db.data.users[m.sender];
    bot = global.db.data.settings[this.user.jid] || {};

    if (bot.antiPrivate && !isOwner && !isROwner) {
        return false;
    }
    
    return false;
};
export default handler;