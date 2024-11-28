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

// Define las categorías del menú
const tags = {
    owner: '`👑 ADMINISTRACIÓN`',
    group: '`👥 CONFIGURACIÓN DE GRUPOS`',
    main: '`💎 FUNCIONES PRINCIPALES`',
    anonymous: '`🎭 CHAT ANÓNIMO`',
    ai: '`🤖 INTELIGENCIA ARTIFICIAL`',
    confessions: '`💌 CONFESIONES`',
    rpg: '`🎮 AVENTURAS Y JUEGOS`',
    fun: '`🎉 DIVERSIÓN`',
    search: '`🔍 BÚSQUEDA`',
    downloader: '`⬇️ DESCARGAS`',
    internet: '`🌐 INTERNET Y HERRAMIENTAS`',
    anime: '`🍙 ANIME`',
    nsfw: '`🔞 CONTENIDO ADULTO`',
    stickers: '`✨ CREACIÓN DE STICKERS`',
    tools: '`🔧 HERRAMIENTAS`',
    utilities: '`⚙️ UTILIDADES`',
};

const defaultMenu = {
    before: `
╔════════════════════════════╗
║     📜 *GUÍA DEL MENÚ TK* 📜     
╚════════════════════════════╝

👋 *%greeting*, %names.  
En este menú encontrarás una descripción detallada de cada comando disponible.  

🗓️ Fecha: %date  
⏰ Hora: %time  
👥 Usuarios registrados: %totalreg  

🛠️ *¿Cómo usar este menú?*
1️⃣ Busca los comandos disponibles en cada sección.  
2️⃣ Usa el prefijo adecuado antes de cada comando (por ejemplo: \`.comando\`).  

🌟 _Consulta esta guía siempre que necesites orientación._  
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

const handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        const { exp, level } = global.db.data.users[m.sender];
        const { min, xp, max } = xpRange(level, global.multiplier);
        const names = await conn.getName(m.sender);
        const d = new Date();
        const locale = 'es';
        const hour = d.getHours();
        const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        const totalreg = Object.keys(global.db.data.users).length;
        const greeting = getGreeting(hour);

        const help = Object.values(global.plugins).filter(plugins => !plugins.disabled).map(plugins => ({
            help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
            tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
            description: plugins.description || 'Sin descripción disponible.',
            premium: plugins.premium,
        }));

        const menuSections = Object.keys(tags).map(tag => {
            const sectionCommands = help
                .filter(plugin => plugin.tags.includes(tag) && plugin.help)
                .map(plugin => plugin.help.map(cmd => defaultMenu.body
                    .replace(/%cmd/g, `${_p}${cmd}`)
                ).join('\n')).join('\n');
            if (!sectionCommands) return '';
            return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + sectionCommands + '\n' + defaultMenu.footer;
        }).filter(v => v).join('\n\n');

        const text = [
            defaultMenu.before,
            menuSections,
            defaultMenu.after
        ].join('\n')
            .replace(/%greeting/g, greeting)
            .replace(/%names/g, names)
            .replace(/%time/g, time)
            .replace(/%date/g, date)
            .replace(/%totalreg/g, totalreg);

        await conn.sendMessage(m.chat, estilo(text), 'conversation');
    } catch (error) {
        console.error(error);
        throw 'Hubo un error generando el menú. Por favor, intenta nuevamente.';
    }
};

const getGreeting = (hour) => {
    if (hour >= 5 && hour < 12) return 'Buenos Días ☀️';
    if (hour >= 12 && hour < 19) return 'Buenas Tardes 🌅';
    return 'Buenas Noches 🌙';
};

// Configuración del comando
handler.help = ['menu', 'allmenu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu'];

export default handler;
