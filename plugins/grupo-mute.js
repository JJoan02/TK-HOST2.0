/** By @MoonContentCreator || https://github.com/MoonContentCreator/BixbyBot-Md **/

import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
    if (command === 'mute') {
        if (!isAdmin) throw '👑 *Solo un administrador puede ejecutar este comando*';
        
        const botNumber = global.owner[0][0] + '@s.whatsapp.net';
        if (m.mentionedJid[0] === botNumber) throw '😼 *El creador del bot no puede ser mutado*';
        
        let userToMute = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
        if (userToMute === conn.user.jid) throw '❌️ *No puedes mutar el bot*';
        
        const groupMetadata = await conn.groupMetadata(m.chat);
        const groupOwner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
        
        if (m.mentionedJid[0] === groupOwner) throw '❌️ *No puedes mutar el creador del grupo*';
        
        let userData = global.db.data.users[userToMute];
        const muteMessage = {
            key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
            message: {
                locationMessage: {
                    name: 'Usuario mutado',
                    jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
                    vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD',
                },
            },
            participant: '0@s.whatsapp.net',
        };

        const responseMessage = '╰⊱❗️⊱ *Menciona a la persona que deseas mutar* ⊱❗️⊱';

        if (!m.mentionedJid[0] && !m.quoted) {
            return conn.reply(m.chat, responseMessage, m);
        }

        if (userData.mute === true) throw '😼 *Este usuario ya ha sido mutado*';

        conn.reply(m.chat, '👑 *Este usuario ha sido mutado*', muteMessage, null, { mentions: [userToMute] });
        global.db.data.users[userToMute].mute = true;
    } else if (command === 'unmute') {
        if (!isAdmin) throw '👑 *Solo un administrador puede ejecutar este comando*';

        let userToUnmute = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
        let userData = global.db.data.users[userToUnmute];
        const unmuteMessage = {
            key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
            message: {
                locationMessage: {
                    name: 'Usuario demutado',
                    jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
                    vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD',
                },
            },
            participant: '0@s.whatsapp.net',
        };

        const responseMessage = '╰⊱❗️⊱ *Menciona a la persona que deseas demutar* ⊱❗️⊱╮';

        if (userToUnmute === m.sender) throw '👑 *Sólo otro administrador puede desmutarte*';

        if (!m.mentionedJid[0] && !m.quoted) {
            return conn.reply(m.chat, responseMessage, m);
        }

        if (userData.mute === false) throw '😼 *Este usuario no ha sido mutado*';

        global.db.data.users[userToUnmute].mute = false;
        conn.reply(m.chat, '👑 *Este usuario ha sido desmutado*', unmuteMessage, null, { mentions: [userToUnmute] });
    }
};

handler.command = /^(mute|unmute)$/i;
handler.botAdmin = true;
handler.admin = true;
handler.group = true;

export default handler;


