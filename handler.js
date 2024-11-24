import { readdirSync } from 'fs';
import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';

const { proto } = (await import('@adiwajshing/baileys')).default;

// Utilidades
const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Estiliza texto
const estilo = (text, style = 1) => {
    const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
    const yStr = { 1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890' };
    return text
        .toLowerCase()
        .split('')
        .map(v => yStr[style]?.[xStr.indexOf(v)] || v)
        .join('');
};

// Devuelve una imagen aleatoria de bienvenida
function getRandomWelcomeImage() {
    const links = [
        'https://pomf2.lain.la/f/onvv8i5b.jpg',
        'https://pomf2.lain.la/f/ucogaqax.jpg',
        'https://pomf2.lain.la/f/m1z5y7ju.jpg',
        'https://pomf2.lain.la/f/fqeogyqi.jpg',
    ];
    return links[Math.floor(Math.random() * links.length)];
}

// Manejo de plugins
const loadPlugins = async () => {
    const plugins = {};
    const pluginPath = join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
    const files = readdirSync(pluginPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
        const name = file.replace('.js', '');
        const plugin = await import(join(pluginPath, file));
        plugins[name] = plugin.default || plugin;
    }

    return plugins;
};

global.plugins = await loadPlugins();

// Manejo de mensajes
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || [];
    if (!chatUpdate) return;

    try {
        const messages = chatUpdate.messages;
        let m = messages[messages.length - 1];
        if (!m) return;

        m = smsg(this, m) || m;
        if (!m) return;

        m.exp = 0;
        m.limit = false;

        if (global.db.data == null) await global.loadDatabase();

        // Configuración de usuario y chat
        let user = global.db.data.users[m.sender] || {};
        global.db.data.users[m.sender] = {
            exp: 0,
            limit: 10,
            afk: -1,
            afkReason: '',
            banned: false,
            role: 'Free user',
            autolevelup: false,
            bank: 0,
            ...user,
        };

        let chat = global.db.data.chats[m.chat] || {};
        global.db.data.chats[m.chat] = {
            isBanned: false,
            welcome: true,
            sWelcomeImageLink: getRandomWelcomeImage(),
            detect: false,
            autoSticker: false,
            nsfw: true,
            ...chat,
        };

        // Configuraciones globales
        let settings = global.db.data.settings[this.user.jid] || {};
        global.db.data.settings[this.user.jid] = {
            self: true,
            autoread: true,
            restrict: true,
            anticall: true,
            ...settings,
        };

        // Ignorar mensajes según configuraciones
        if (shouldIgnoreMessage(m)) return;

        // Incrementar experiencia
        m.exp += Math.ceil(Math.random() * 10);

        const { isCommand, usedPrefix, command, args } = parseMessage(m);
        if (!isCommand) return;

        const plugin = findMatchingPlugin(command);
        if (!plugin) return;

        // Validaciones de permisos
        if (!(await checkPermissions(m, plugin))) return;

        // Ejecutar el plugin
        await executePlugin(m, plugin, { usedPrefix, args });

    } catch (e) {
        console.error('Error en el handler:', e);
    }
}

// Determina si debe ignorar el mensaje
function shouldIgnoreMessage(m) {
    const opts = global.opts || {};
    return (
        (opts['self'] && !m.fromMe) ||
        (opts['gconly'] && !m.isGroup) ||
        (opts['pconly'] && m.isGroup)
    );
}

// Analiza el mensaje y extrae información
function parseMessage(m) {
    const usedPrefix = global.prefix || '.';
    const noPrefix = m.text.replace(usedPrefix, '');
    const [command, ...args] = noPrefix.trim().split(/\s+/);
    return { isCommand: m.text.startsWith(usedPrefix), usedPrefix, command, args };
}

// Encuentra el plugin que corresponde al comando
function findMatchingPlugin(command) {
    return Object.values(global.plugins).find(plugin =>
        Array.isArray(plugin.command)
            ? plugin.command.includes(command)
            : plugin.command === command
    );
}

// Verifica permisos
async function checkPermissions(m, plugin) {
    const user = global.db.data.users[m.sender];
    if (plugin.admin && !m.isAdmin) return false;
    if (plugin.premium && !user.premium) return false;
    return true;
}

// Ejecuta el plugin
async function executePlugin(m, plugin, { usedPrefix, args }) {
    try {
        await plugin.call(this, m, { usedPrefix, args });
        if (plugin.exp) m.exp += plugin.exp;
    } catch (e) {
        console.error('Error ejecutando plugin:', e);
    }
}

// Observa cambios en el archivo
let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
    console.log(chalk.redBright('Actualizando handler.js'));
    unwatchFile(file);
    import(`${file}?update=${Date.now()}`);
});

