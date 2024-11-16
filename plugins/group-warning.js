let war = global.maxwarn;
const handler = async (m, { conn, text, args, groupMetadata, usedPrefix, command }) => {      
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!who) throw m.reply(`menciona al usuario para advertirlo\n\nejemplo : ${usedPrefix + command} @user`);
    if (!(who in global.db.data.users)) throw m.reply(`el usuario no existe en la base de datos`);
    let name = conn.getName(m.sender);
    let warn = global.db.data.users[who].warn;
    if (warn < war) {
        global.db.data.users[who].warn += 1;
        m.reply(`
⚠️ *Advertencia Aplicada* ⚠️

▢ *Admin:* ${name}
▢ *Usuario:* @${who.split`@`[0]}
▢ *Advertencias:* ${warn + 1}/${war}
▢ *Mensaje:* ${text}`, null, { mentions: [who] }); 
        m.reply(`
⚠️ *ADVERTENCIA* ⚠️
Recibiste una advertencia del administrador

▢ *Advertencias:* ${warn + 1}/${war} 
Si recibes una *${war}* Advertencia, serás eliminado automáticamente del grupo`, who);
    } else if (warn == war) {
        global.db.data.users[who].warn = 0;
        m.reply(`⛔ Los usuarios que excedan la advertencia *${war}* serán eliminados`);
        await time(3000);
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        m.reply(`♻️ Te eliminaron del grupo *${groupMetadata.subject}* porque te advirtieron *${war}* veces`, who);
    }
};

handler.help = ['warn @user'];
handler.tags = ['group'];
handler.command = ['warn']; 
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

const time = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
