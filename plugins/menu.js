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
    main: '`💎 FUNCIONES PRINCIPALES`',
    group: '`👥 CONFIGURACIÓN DE GRUPOS`',
    search: '`🔍 BÚSQUEDA`',
    downloader: '`⬇️ DESCARGAS`',
    nsfw: '`🔞 CONTENIDO ADULTO`',
    tools: '`🔧 HERRAMIENTAS`'
};

const defaultMenu = {
    before: `
╔════════════════════════════╗
║     📜 *GUÍA DEL MENÚ TK* 📜     
╚════════════════════════════╝

👋 *Hola, %names*.  
En este menú encontrarás las categorías disponibles.  

🗓️ Fecha: %date  
⏰ Hora: %time  
👥 Usuarios registrados: %totalreg  

🛠️ *¿Cómo usar este menú?*
1️⃣ Busca la categoría deseada.  
2️⃣ Usa el comando correspondiente para entrar al submenú.  

🌟 _Consulta esta guía siempre que necesites orientación._  
`.trimStart(),
    body: `➤ %cmd - %description`,
    after: `
🌐 **Comunidad TK: Más que un bot, somos un equipo.**  
👑 *Admin-TK está siempre contigo.*`,
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
            case 'menudescargas':
                subMenuText = `
╔════════════════════════════╗
║     ⬇️ *MENÚ DESCARGAS* ⬇️     
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
║     🔞 *MENÚ NSFW* 🔞     
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
║     🔧 *MENÚ HERRAMIENTAS* 🔧     
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
🗓️ Fecha: ${date}  
⏰ Hora: ${time}  
👥 Usuarios registrados: ${totalreg}
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
    help: ['menudescargas', 'menunsfw', 'menutools'],
    tags: ['main'],
    command: ['menudescargas', 'menunsfw', 'menutools'],
    handler: subMenuHandler,
};

export default handler;
