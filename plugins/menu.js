const { 
    BufferJSON, 
    WA_DEFAULT_EPHEMERAL, 
    generateWAMessageFromContent, 
    proto, 
    generateWAMessageContent, 
    generateWAMessage, 
    prepareWAMessageMedia, 
    areJidsSameUser, 
    getContentType 
} = (await import('@adiwajshing/baileys')).default

process.env.TZ = 'America/Lima'
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import moment from "moment-timezone";
import { xpRange } from '../lib/levelling.js';

// Listado de categorías del menú
const arrayMenu = [
    'all',
    'main',
    'anonymous',
    'ai',
    'jadibot',
    'confesar',
    'rpg',
    'fun',
    'search',
    'downloader',
    'internet',
    'anime',
    'nsfw',
    'sticker',
    'tools',
    'group',
    'owner',
    ''
];

// Función para estilizar el texto
const estilo = (text, style = 1) => {
    const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
    const yStr = Object.freeze({
        1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
    });
    const replacer = xStr.map((v, i) => ({ original: v, convert: yStr[style].split('')[i] }));
    return text.toLowerCase().split('').map(v => replacer.find(x => x.original == v)?.convert || v).join('');
};

// Definición de categorías del menú con emogis y descripción
const allTags = {
    all: "🏠 *MENU COMPLETO*",
    main: "📜 *MENU PRINCIPAL* - Accede a las funciones principales del bot",
    downloader: "📀 *MENU DESCARGAS* - Descarga videos, música y más",
    jadibot: "🤖 *MENU SUBBOTS* - Convierte tu número en un subbot",
    rpg: "🌟 *MENU RPG* - Juega al RPG y sube de nivel",
    ai: "🤖 *MENU IA* - Accede a funciones de inteligencia artificial",
    search: "🔍 *MENU BÚSQUEDA* - Encuentra información rápidamente",
    anime: "🌸 *MENU ANIME* - Comandos relacionados con anime y manga",
    sticker: "🎟️ *MENU STICKERS* - Crea y envía stickers personalizados",
    fun: "🎉 *MENU DIVERSION* - Comandos de entretenimiento y juegos",
    group: "👥 *MENU GRUPO* - Administración de grupos de WhatsApp",
    nsfw: "😈 *MENU NSFW* - Contenido solo para adultos",
    info: "📃 *MENU INFORMACIÓN* - Información sobre el bot y otros datos",
    internet: "🌐 *MENU INTERNET* - Herramientas relacionadas con Internet",
    owner: "👑 *MENU ADMIN* - Funciones solo para el propietario del bot",
    tools: "🤨 *MENU HERRAMIENTAS* - Herramientas útiles para diferentes tareas",
    anonymous: "👻 *CHAT ANÓNIMO* - Chatea de manera anónima",
    "": "💡 *SIN CATEGORÍA*"
}

// Plantilla por defecto del menú
const defaultMenu = {
    before: `
*Hola %name* 👋
Soy *Admin-TK*, un bot de WhatsApp para ayudarte a realizar diferentes tareas, buscar información y mucho más.

*Detalles del Sistema:*
- Librería: *Baileys*
- Funcionalidad: *Asistente*

➜ *Tiempo Activo*: %uptime
➜ *Fecha*: %date
➜ *Hora*: %time
➜ *Prefijo Usado*: [ %p ]
`.trimStart(),
    header: '🔗 *%category*',
    body: '├ 📌 %cmd %islimit %isPremium',
    footer: '└───────
',
    after: `
*Nota:* Puedes escribir .menu <categoría> para ver un menú específico.
★ Ejemplo: *.menu tools*
`
}

let handler = async (m, { conn, usedPrefix: _p, args = [], command }) => {
    try {
        let { exp, limit, level, role } = global.db.data.users[m.sender];
        let { min, xp, max } = xpRange(level, global.multiplier);
        let name = `@${m.sender.split`@`[0]}`;
        let teks = args[0] || '';
        
        // Obtener fecha y hora local
        let d = new Date(new Date() + 3600000);
        let locale = 'es';
        let date = d.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        let time = d.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });

        let _uptime = process.uptime() * 1000;
        let uptime = clockString(_uptime);
        
        let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
            return {
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                prefix: 'customPrefix' in plugin,
                limit: plugin.limit,
                premium: plugin.premium,
                enabled: !plugin.disabled,
            };
        });

        // Mostrar el menú principal si no se pasa un argumento específico
        if (!teks) {
            let menuList = `${defaultMenu.before}\n\n┌─── 🏠 *LISTA DE MENUS*\n`;
            for (let tag of arrayMenu) {
                if (tag && allTags[tag]) {
                    menuList += `├ 👉 ${_p}menu ${tag}\n`;
                }
            }
            menuList += `└───────\n\n${defaultMenu.after}`;

            let replace = {
                '%': '%',
                p: _p, 
                uptime,
                name, 
                date,
                time
            };

            let text = menuList.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), 
                (_, name) => '' + replace[name]);

            await conn.sendFile(m.chat, "https://pomf2.lain.la/f/ucogaqax.jpg", 'menu.jpg', estilo(text), global.fliveLoc2, null);
            return;
        }

        // Mostrar menú específico
        if (!allTags[teks]) {
            return m.reply(`El menú "${teks}" no está registrado.
Escribe ${_p}menu para ver la lista de menús.`);
        }

        let menuCategory = defaultMenu.before + '\n\n';
        
        if (teks === 'all') {
            // Mostrar todos los menús
            for (let tag of arrayMenu) {
                if (tag !== 'all' && allTags[tag]) {
                    menuCategory += defaultMenu.header.replace(/%category/g, allTags[tag]) + '\n';
                    
                    let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help);
                    for (let menu of categoryCommands) {
                        for (let help of menu.help) {
                            menuCategory += defaultMenu.body
                                .replace(/%cmd/g, menu.prefix ? help : _p + help)
                                .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                                .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '') + '\n';
                        }
                    }
                    menuCategory += defaultMenu.footer + '\n';
                }
            }
        } else {
            // Mostrar menú específico
            menuCategory += defaultMenu.header.replace(/%category/g, allTags[teks]) + '\n';
            
            let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(teks) && menu.help);
            for (let menu of categoryCommands) {
                for (let help of menu.help) {
                    menuCategory += defaultMenu.body
                        .replace(/%cmd/g, menu.prefix ? help : _p + help)
                        .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                        .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '') + '\n';
                }
            }
            menuCategory += defaultMenu.footer + '\n';
        }

        menuCategory += '\n' + defaultMenu.after;
        
        let replace = {
            '%': '%',
            p: _p, 
            uptime, 
            name,
            date,
            time
        };

        let text = menuCategory.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), 
            (_, name) => '' + replace[name]);

        await conn.sendFile(m.chat, "https://pomf2.lain.la/f/ucogaqax.jpg", 'menu.jpg', estilo(text), global.fliveLoc2, null);
    } catch (e) {
        conn.reply(m.chat, 'Perdón, hubo un error al mostrar el menú.', m);
        console.error(e);
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help)$/i;
handler.exp = 3;

export default handler;

// Función para dar formato al tiempo de actividad
function clockString(ms) {
    if (isNaN(ms)) return '--';
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
    }
