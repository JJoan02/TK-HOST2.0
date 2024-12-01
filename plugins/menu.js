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
    internet: '`🌐 INTERNET Y HERRAMIENTAS`',
    anime: '`🍙 ANIME`',
    anonymous: '`🎭 CHAT ANÓNIMO`',
    ai: '`🤖 INTELIGENCIA ARTIFICIAL`',
    confesar: '`💌 CONFESIONES`',
    rpg: '`🎮 AVENTURAS Y JUEGOS`',
    fun: '`🎉 DIVERSIÓN`',
    sticker: '`✨ CREACIÓN DE STICKERS`',
    tools: '`🔧 HERRAMIENTAS`',
    owner: '`👑 ADMINISTRACIÓN`'
};

const defaultMenu = {
    before: `
╔════════════════════════════╗
║     📜 *${estilo('guía del menú tk')}* 📜     
╚════════════════════════════╝

👋 *${estilo('hola, xd')}*.  
${estilo('en este menú encontrarás una descripción detallada de cada comando disponible.')}

🗓️ ${estilo('fecha')}: %date  
⏰ ${estilo('hora')}: %time  
👥 ${estilo('usuarios registrados')}: %totalreg  

🛠️ *${estilo('¿cómo usar este menú?')}*
1️⃣ ${estilo('busca los comandos disponibles en cada sección.')}.  
2️⃣ ${estilo('usa el prefijo adecuado antes de cada comando (por ejemplo: `.comando`).')}.  

🌟 _${estilo('consulta esta guía siempre que necesites orientación.')}_  
`.trimStart(),
    header: `
╭───✦ *%category* ✦───╮`,
    body: `➤ %cmd`,
    footer: `
╰──────────────╯`,
    after: `
🌐 **Comunidad TK: Más que un bot, somos un equipo.**  
👑 *Admin-TK está siempre contigo.*`,
};

const shortMenu = `
╔════════════════════════════╗
║     📜 *${estilo('guía del menú tk')}* 📜     
╚════════════════════════════╝

👋 *${estilo('hola, xd')}*.  
${estilo('en este menú encontrarás una descripción detallada de cada comando disponible.')}

🗓️ ${estilo('fecha')}: %date  
⏰ ${estilo('hora')}: %time  
👥 ${estilo('usuarios registrados')}: %totalreg  

🛠️ *${estilo('¿cómo usar este menú?')}*
1️⃣ ${estilo('busca los comandos disponibles en cada sección.')}.  
2️⃣ ${estilo('usa el prefijo adecuado antes de cada comando (por ejemplo: `.comando`).')}.  

🌟 _${estilo('consulta esta guía siempre que necesites orientación.')}_  

> Ver más...
`.trimStart();

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

        if (!m.text.includes('ver más')) {
            // Enviar versión reducida del menú
            await conn.sendMessage(m.chat, estilo(shortMenu)
                .replace(/%names/g, names)
                .replace(/%time/g, time)
                .replace(/%date/g, date)
                .replace(/%totalreg/g, totalreg), { quoted: m });
        } else {
            // Enviar menú completo
            const help = Object.values(global.plugins).filter(plugins => !plugins.disabled).map(plugins => ({
                help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
                tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
                description: plugins.description || 'Sin descripción disponible.',
                limit: plugins.limit,
                premium: plugins.premium,
            }));

            const menuSections = Object.keys(tags).map(tag => {
                const sectionCommands = help
                    .filter(plugin => plugin.tags.includes(tag) && plugin.help)
                    .map(plugin => plugin.help.map(cmd => defaultMenu.body
                        .replace(/%cmd/g, `${_p}${cmd}`)
                        .replace(/%description/g, plugin.description)
                    ).join('\n')).join('\n');
                if (!sectionCommands) return '';
                return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + sectionCommands + '\n' + defaultMenu.footer;
            }).filter(v => v).join('\n\n');

            const text = [
                defaultMenu.before,
                menuSections,
                defaultMenu.after
            ].join('\n')
                .replace(/%names/g, names)
                .replace(/%time/g, time)
                .replace(/%date/g, date)
                .replace(/%totalreg/g, totalreg);

            const imageUrl = 'https://pomf2.lain.la/f/ucogaqax.jpg'; // Cambia esta URL por la imagen que prefieras

            await conn.sendFile(m.chat, imageUrl, 'menu.jpg', estilo(text), m);
        }
    } catch (error) {
        console.error(error);
        throw 'Hubo un error generando el menú. Por favor, intenta nuevamente.';
    }
};

// Funciones auxiliares
const getGreeting = (hour) => {
    if (hour >= 5 && hour < 12) return 'Buenos Días ☀️';
    if (hour >= 12 && hour < 19) return 'Buenas Tardes 🌅';
    return 'Buenas Noches 🌙';
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu', 'ver más'];

export default handler;
