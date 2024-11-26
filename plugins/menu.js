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
    main: '`Principal`',
    anonymous: '`Chat Anónimo`',
    ai: '`Funciones AI`',
    jadibot: '`Jadibots/Subbots`',
    confesar: '`Confesiones`',
    rpg: '`Roleplay`',
    fun: '`Divertido`',
    search: '`Búsqueda`',
    downloader: '`Descargas`',
    internet: '`Internet`',
    anime: '`Anime`',
    nsfw: '`NSFW`',
    sticker: '`Sticker`',
    tools: '`Herramientas`',
    group: '`Grupos`',
    owner: '`Owner`',
};

const defaultMenu = {
    before: `
👋 %ucapan %names
%readmore
_*\`</${global.namebot}>\`*_
`.trimStart(),
    header: '╭─❏ *%category*',
    body: '┆ ➤ %cmd %islimit %isPremium',
    footer: '╰───────────────',
    after: `\n> ©️ Admin-TK Bot 🌟`,
};

const handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        const { exp, limit, level, role } = global.db.data.users[m.sender];
        const { min, xp, max } = xpRange(level, global.multiplier);
        const name = m.sender;
        const taguser = `@${(m.sender || '').replace(/@s\.whatsapp\.net/g, '')}`;
        const names = await conn.getName(m.sender);
        const d = new Date(new Date() + 3600000);
        const locale = 'es';
        const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        const uptime = clockString(process.uptime() * 1000);

        // Saludo dinámico
        const ucapan = getGreeting(moment.tz('America/Buenos_Aires').hour());

        // Filtrar y organizar los plugins habilitados
        const help = Object.values(global.plugins).filter(plugins => !plugins.disabled).map(plugins => ({
            help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
            tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
            prefix: 'customPrefix' in plugins,
            limit: plugins.limit,
            premium: plugins.premium,
        }));

        // Crear las secciones del menú dinámicamente
        const menuSections = Object.keys(tags).map(tag => {
            const sectionCommands = help
                .filter(plugin => plugin.tags.includes(tag) && plugin.help)
                .map(plugin => plugin.help.map(cmd => defaultMenu.body
                    .replace(/%cmd/g, plugin.prefix ? cmd : `${_p}${cmd}`)
                    .replace(/%islimit/g, plugin.limit ? 'Ⓛ' : '')
                    .replace(/%isPremium/g, plugin.premium ? '🅟' : '')
                ).join('\n')).join('\n');
            if (!sectionCommands) return '';
            return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + sectionCommands + '\n' + defaultMenu.footer;
        }).filter(v => v).join('\n\n');

        // Generar el menú completo
        const text = [
            defaultMenu.before,
            menuSections,
            defaultMenu.after
        ].join('\n').replace(/%ucapan/g, ucapan).replace(/%names/g, names);

        // Enviar el menú
        await conn.sendFile(m.chat, "https://pomf2.lain.la/f/molwxb7d.jpg", 'menu.jpg', estilo(text), m);
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

const clockString = (ms) => {
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu'];

export default handler;
