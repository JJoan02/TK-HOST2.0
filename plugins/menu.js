import moment from 'moment-timezone';
import { xpRange } from '../lib/levelling.js';

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
║     📜 GUÍA DEL MENÚ TK 📜     
╚════════════════════════════╝

👋 Hola, %names.  
En este menú encontrarás una descripción detallada de cada comando disponible.  

🗓️ Fecha: %date  
⏰ Hora: %time  
👥 Usuarios registrados: %totalreg  

🛠️ ¿Cómo usar este menú?
1️⃣ Busca los comandos disponibles en cada sección.  
2️⃣ Usa el prefijo adecuado antes de cada comando (por ejemplo: \`.comando\`).  

🌟 Consulta esta guía siempre que necesites orientación.  
`.trimStart(),
    header: `
╭───✦ %category ✦───╮`,
    body: `➤ %cmd`,
    footer: `
╰──────────────╯`,
    after: `
🌐 **Comunidad TK: Más que un bot, somos un equipo.**  
👑 *Admin-TK está siempre contigo.*`,
};

const shortMenu = `
╔════════════════════════════╗
║     📜 GUÍA DEL MENÚ TK 📜     
╚════════════════════════════╝

👋 Hola, %names.  
En este menú encontrarás una descripción detallada de cada comando disponible.

🗓️ Fecha: %date  
⏰ Hora: %time  
👥 Usuarios registrados: %totalreg  

🛠️ ¿Cómo usar este menú?
1️⃣ Busca los comandos disponibles en cada sección.  
2️⃣ Usa el prefijo adecuado antes de cada comando (por ejemplo: \`.comando\`).  

🌟 Consulta esta guía siempre que necesites orientación.

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
            await conn.sendMessage(m.chat, {
                text: shortMenu
                    .replace(/%names/g, names)
                    .replace(/%time/g, time)
                    .replace(/%date/g, date)
                    .replace(/%totalreg/g, totalreg),
                quoted: m
            });
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

            await conn.sendMessage(m.chat, {
                text: text,
                quoted: m
            });
        }
    } catch (error) {
        console.error(error);
        throw 'Hubo un error generando el menú. Por favor, intenta nuevamente.';
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu', 'ver más'];

export default handler;
