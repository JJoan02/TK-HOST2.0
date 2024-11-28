// Plugin 1: Allmenu (Mostrar menú corto con categorías)
import moment from 'moment-timezone';
import { xpRange } from '../lib/levelling.js';

const tags = {
    main: '`💎 FUNCIONES PRINCIPALES`',
    anonymous: '`🎭 CHAT ANÓNIMO`',
    ai: '`🤖 INTELIGENCIA ARTIFICIAL`',
    confesar: '`💌 CONFESIONES`',
    rpg: '`🎮 AVENTURAS Y JUEGOS`',
    fun: '`🎉 DIVERSIÓN`',
    search: '`🔍 BÚSQUEDA`',
    downloader: '`⬇️ DESCARGAS`',
    internet: '`🌐 INTERNET Y HERRAMIENTAS`',
    anime: '`🍙 ANIME`',
    nsfw: '`🔞 CONTENIDO ADULTO`',
    sticker: '`✨ CREACIÓN DE STICKERS`',
    tools: '`🔧 HERRAMIENTAS`',
    group: '`👥 CONFIGURACIÓN DE GRUPOS`',
    owner: '`👑 ADMINISTRACIÓN`',
};

const defaultMenu = {
    before: `
╔════════════════════════════╗
║     📜 *GUÍA DEL MENÚ TK* 📜     
╚════════════════════════════╝

👋 *Hola, %names*.  
En este menú encontrarás una lista de categorías disponibles.  

🗓️ Fecha: %date  
⏰ Hora: %time  
👥 Usuarios registrados: %totalreg  

🛠️ *¿Cómo usar este menú?*
1️⃣ Usa el prefijo adecuado antes de cada comando de categoría (por ejemplo: \`.mdescargas\`).  

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
        const names = await conn.getName(m.sender);
        const d = new Date();
        const locale = 'es';
        const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        const totalreg = Object.keys(global.db.data.users).length;

        const menuSections = Object.keys(tags).map(tag => {
            return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + defaultMenu.footer;
        }).join('\n\n');

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

        await conn.sendFile(m.chat, imageUrl, 'menu.jpg', text, m);
    } catch (error) {
        console.error(error);
        throw 'Hubo un error generando el menú. Por favor, intenta nuevamente.';
    }
};

handler.help = ['allmenu'];
handler.tags = ['main'];
handler.command = ['allmenu'];

export default handler;


// Plugin 2: Menu por categoría (Mostrar menú específico de cada categoría)
const handlerCategory = async (m, { conn, usedPrefix: _p, args }) => {
    try {
        const category = args[0]?.toLowerCase();
        if (!category || !tags[category]) {
            return m.reply(`Categoría no válida. Usa \`.menu\` para ver las categorías disponibles.`);
        }

        const help = Object.values(global.plugins).filter(plugins => !plugins.disabled).map(plugins => ({
            help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
            tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
            description: plugins.description || 'Sin descripción disponible.',
            limit: plugins.limit,
            premium: plugins.premium,
        }));

        const sectionCommands = help
            .filter(plugin => plugin.tags.includes(category) && plugin.help)
            .map(plugin => plugin.help.map(cmd => defaultMenu.body
                .replace(/%cmd/g, `${_p}${cmd}`)
                .replace(/%description/g, plugin.description)
            ).join('\n')).join('\n');

        if (!sectionCommands) return m.reply(`No hay comandos disponibles en la categoría \`${tags[category]}\``);

        const text = [
            defaultMenu.header.replace(/%category/g, tags[category]),
            sectionCommands,
            defaultMenu.footer
        ].join('\n');

        await m.reply(text);
    } catch (error) {
        console.error(error);
        throw 'Hubo un error mostrando el menú de la categoría. Por favor, intenta nuevamente.';
    }
};

handlerCategory.help = ['menu'];
handlerCategory.tags = ['main'];
handlerCategory.command = ['menu'];

export default handlerCategory;
