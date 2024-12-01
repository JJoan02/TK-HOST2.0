import moment from 'moment-timezone';
import { xpRange } from '../lib/levelling.js';

const estilo = (text, style = 1) => {
    const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
    const yStr = Object.freeze({
        1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
    });
    const replacer = [];
    xStr.map((v, i) => replacer.push({
        original: v,
        convert: yStr[style].split('')[i]
    }));
    return text
        .toLowerCase()
        .split('')
        .map(v => replacer.find(x => x.original === v)?.convert || v)
        .join('');
};

const tags = {
    general: '`💎 ꜰᴜɴᴄɪᴏɴᴇꜱ Generales`',
    group: '`👥 ᴄᴏɴꜰɪɢᴜʀᴀᴄɪóɴ ᴅᴇ ɢʀᴜᴘᴏꜱ`',
    search: '`🔍 ʙúꜱqᴜᴇᴅᴀ`',
    downloader: '`⬇️ ᴅᴇꜱᴄᴀʀɢᴀꜱ`',
    nsfw: '`🔞 ᴄᴏɴᴛᴇɴɪᴅᴏ ᴀᴅᴜʟᴛᴏ`',
    tools: '`🔧 ʜᴇʀʀᴀᴍɪᴇɴᴛᴀꜱ`'
};

const defaultMenu = {
    before: `
╔════════════════════════════╗
║     📜 *ɢᴜíᴀ ᴅᴇʟ ᴍᴇɴú ᴛᴋ* 📜     
╚════════════════════════════╝

👋 *ʜᴏʟᴀ, %names*.  
ᴇɴ ᴇꜱᴛᴇ ᴍᴇɴú ᴇɴᴄᴏɴᴛʀᴀʀáꜱ ʟᴀꜱ ᴄᴀᴛᴇɢᴏʀíᴀꜱ ᴅɪꜱᴘᴏɴɪʙʟᴇꜱ.  

🗓️ ꜰᴇᴄʜᴀ: %date  
⏰ ʜᴏʀᴀ: %time  
👥 ᴜꜱᴜᴀʀɪᴏꜱ ʀᴇɢɪꜱᴛʀᴀᴅᴏꜱ: %totalreg  

🌟 _ᴄᴏɴꜱᴜʟᴛᴀ ᴇꜱᴛᴀ ɢᴜíᴀ ꜱɪᴇᴍᴘʀᴇ qᴜᴇ ɴᴇᴄᴇꜱɪᴛᴇꜱ ᴏʀɪᴇɴᴛᴀᴄɪóɴ._  
`.trimStart(),
    body: `➤   %description\n> .         %cmd`,
    after: `

> 👑 *Admin-TK / Comunidad TK*`,
};

const handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        const { exp, limit, level } = global.db.data.users[m.sender];
        const { min, xp, max } = xpRange(level, global.multiplier);
        const names = await conn.getName(m.sender);
        const d = new Date();
        const locale = 'es';
        const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        const totalreg = Object.keys(global.db.data.users).length;

        const menuCategories = Object.keys(tags).map(tag => {
            return defaultMenu.body
                .replace(/%cmd/g, `${_p}menu${tag}`)
                .replace(/%description/g, tags[tag]);
        }).join('\n');

        const text = [
            defaultMenu.before,
            menuCategories,
            defaultMenu.after
        ].join('\n')
            .replace(/%names/g, names)
            .replace(/%time/g, time)
            .replace(/%date/g, date)
            .replace(/%totalreg/g, totalreg);

        const imageUrl = 'https://pomf2.lain.la/f/ucogaqax.jpg'; // Cambia esta URL por la imagen que prefieras

        await conn.sendFile(m.chat, imageUrl, 'menu.jpg', estilo(text), m);
    } catch (error) {
        console.error(error);
        throw 'Hubo un error generando el menú. Por favor, intenta nuevamente.';
    }
};

// Submenús por categoría

const subMenuHandler = async (m, { conn, usedPrefix: _p, command }) => {
    try {
        const names = await conn.getName(m.sender);
        const d = new Date();
        const locale = 'es';
        const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        const totalreg = Object.keys(global.db.data.users).length;

        let subMenuText = '';

        switch (command) {
            case 'menugeneral':
                subMenuText = `
╔════════════════════════════╗
║     💎 *ᴍᴇɴú ꜰᴜɴᴄɪᴏɴᴇꜱ ɢᴇɴᴇʀᴀʟᴇꜱ* 💎     
╚════════════════════════════╝

📋 *Instrucciones:*
- Usa los comandos a continuación para acceder a las funciones generales.

➤ \`.generalcmd1\` - Descripción del comando 1.
➤ \`.generalcmd2\` - Descripción del comando 2.
`;
                break;
            case 'menugrupo':
                subMenuText = `
╔════════════════════════════╗
║     👥 *ᴍᴇɴú ᴄᴏɴꜰɪɢᴜʀᴀᴄɪóɴ ᴅᴇ ɢʀᴜᴘᴏꜱ* 👥     
╚════════════════════════════╝

📋 *Instrucciones:*
- Usa los comandos a continuación para configurar los grupos.

➤ \`.grupocmd1\` - Descripción del comando 1.
➤ \`.grupocmd2\` - Descripción del comando 2.
`;
                break;
            case 'menusearch':
                subMenuText = `
╔════════════════════════════╗
║     🔍 *ᴍᴇɴú ʙúꜱqᴜᴇᴅᴀ* 🔍     
╚════════════════════════════╝

📋 *Instrucciones:*
- Usa los comandos a continuación para realizar búsquedas.

➤ \`.searchcmd1\` - Descripción del comando 1.
➤ \`.searchcmd2\` - Descripción del comando 2.
`;
                break;
            case 'menudescargas':
                subMenuText = `
╔════════════════════════════╗
║     ⬇️ *ᴍᴇɴú ᴅᴇꜱᴄᴀʀɢᴀꜱ* ⬇️     
╚════════════════════════════╝

📋 *Instrucciones:*
- Usa los comandos a continuación para descargar contenido.

➤ \`.yt <link>\` - Descargar videos de YouTube.
➤ \`.img <término>\` - Descargar imágenes.
➤ \`.music <título>\` - Descargar música.
`;
                break;
            case 'menunsfw':
                subMenuText = `
╔════════════════════════════╗
║     🔞 *ᴍᴇɴú ᴄᴏɴᴛᴇɴɪᴅᴏ ᴀᴅᴜʟᴛᴏ* 🔞     
╚════════════════════════════╝

📋 *Instrucciones:*
- Usa los comandos a continuación para acceder a contenido NSFW.

➤ \`.nsfwimg\` - Imágenes NSFW.
➤ \`.nsfwvideo\` - Videos NSFW.
➤ \`.nsfwcomic\` - Cómics NSFW.
`;
                break;
            case 'menutools':
                subMenuText = `
╔════════════════════════════╗
║     🔧 *ᴍᴇɴú ʜᴇʀʀᴀᴍɪᴇɴᴛᴀꜱ* 🔧     
╚════════════════════════════╝

📋 *Instrucciones:*
- Usa los comandos a continuación para acceder a herramientas útiles.

➤ \`.calc <expresión>\` - Calculadora.
➤ \`.convert <valor>\` - Conversor de unidades.
➤ \`.passgen <longitud>\` - Generador de contraseñas.
`;
                break;
            // Agrega más casos para otros submenús
        }

        const text = `
${subMenuText}
🗓️ ꜰᴇᴄʜᴀ: ${date}  
⏰ ʜᴏʀᴀ: ${time}  
👥 ᴜꜱᴜᴀʀɪᴏꜱ ʀᴇɢɪꜱᴛʀᴀᴅᴏꜱ: ${totalreg}
`;

        await conn.sendMessage(m.chat, estilo(text), m);
    } catch (error) {
        console.error(error);
        throw 'Hubo un error generando el submenú. Por favor, intenta nuevamente.';
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu'];

export const subMenuHandlerExport = {
    help: ['menugeneral', 'menugrupo', 'menusearch', 'menudescargas', 'menunsfw', 'menutools'],
    tags: ['main'],
    command: ['menugeneral', 'menugrupo', 'menusearch', 'menudescargas', 'menunsfw', 'menutools'],
    handler: subMenuHandler,
};

export default handler;
