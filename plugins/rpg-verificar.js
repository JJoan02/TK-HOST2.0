import { createHash } from 'crypto';
import fetch from 'node-fetch';
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;
let handler = async function (m, { conn, text, usedPrefix, command }) {
  let codigosIdiomas = ['es', 'en', 'pt', 'id', 'ar', 'de', 'it'];
  let nombresIdiomas = {
    'es': 'Español',
    'en': 'English',
    'pt': 'Português',
    'id': 'Bahasa Indonesia',
    'ar': 'Arab (عرب)',
    'de': 'Deutsch',
    'it': 'Italiano'
  };

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => gataImg.getRandom());

  let tag = `${m.sender.split("@")[0]}`;
  let aa = tag + '@s.whatsapp.net';
  let user = global.db.data.users[m.sender];

  if (/^(verify|verificar|reg(ister)?)$/i.test(command)) {
    if (user.registered === true) return m.reply(lenguajeGB.smsVerify0(usedPrefix) + '*');
    if (!Reg.test(text)) return m.reply(lenguajeGB.smsVerify1(usedPrefix, command));
    let [_, name, splitter, age] = text.match(Reg);
    if (!name) return m.reply(lenguajeGB.smsVerify2());
    if (!age) return m.reply(lenguajeGB.smsVerify3());
    age = parseInt(age);
    if (age > 50) return m.reply(lenguajeGB.smsVerify4());
    if (age < 10) return m.reply(lenguajeGB.smsVerify5());
    if (name.length >= 30) return m.reply(lenguajeGB.smsVerify6());
    user.name = name + 'ͧͧͧͦꙶͣͤ✓ᚲᵀᴷ'.trim();
    user.age = age;

    // Configura el idioma predeterminado como español
    user.GBLanguage = 'es';

    user.regTime = + new Date;
    user.registered = true;
    let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6);
    let caption = `✅ *V E R I F I C A C I O N* ✅
*⎔ IDIOMA* 
• Español
*⎔ USUARIO* 
• @${tag}
*⎔ NOMBRE* 
• ${user.name}
*⎔ EDAD*
• ${user.age}
*⎔ INSIGNIA DE VERIFICACIÓN*
• 'ͧͧͧͦꙶͣͤ✓ᚲᴳᴮ'
*⎔ ID DE REGISTRO*
• \`\`\`${sn}\`\`\``.trim();

    await conn.sendFile(m.chat, pp, 'gata.jpg', caption, m, false, { mentions: [aa] });
  }
};

handler.command = /^(verify|verificar|reg(ister)?|idiomatk)$/i;
export default handler;
