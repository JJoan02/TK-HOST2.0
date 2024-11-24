import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';

const { proto } = (await import('@adiwajshing/baileys')).default;

// Utilidades básicas
const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Función para estilizar texto
const estilo = (text, style = 1) => {
    const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
    const yStr = { 1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890' };
    return text
        .toLowerCase()
        .split('')
        .map(v => yStr[style]?.[xStr.indexOf(v)] || v)
        .join('');
};

// Manejo del mensaje entrante
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || [];
    if (!chatUpdate) return;

    try {
        let m = chatUpdate.messages[chatUpdate.messages.length - 1];
        if (!m) return;

        m = smsg(this, m) || m;
        if (!m) return;

        m.exp = 0;
        m.limit = false;

        await handleUserData(m);
        await handleChatData(m);
        await handleSettings(m);

        if (shouldIgnoreMessage(m)) return;

        // Incrementa la experiencia
        m.exp += Math.ceil(Math.random() * 10);

        const { isCommand, usedPrefix, command, args } = parseMessage(m);
        if (!isCommand) return;

        const plugin = findMatchingPlugin(command);
        if (!plugin) return;

        // Validaciones de permisos y restricciones
        if (!(await checkPermissions(m, plugin))) return;

        // Ejecuta el plugin
        await executePlugin(m, plugin, { usedPrefix, args });
    } catch (e) {
        console.error('Error en el handler:', e);
    }
}

// Maneja datos del usuario
async function handleUserData(m) {
    const user = global.db.data.users[m.sender] || {};
    const defaultUserData = {
        exp: 0,
        limit: 10,
        afk: -1,
        afkReason: '',
        banned: false,
        role: 'Free user',
        autolevelup: false,
        bank: 0,
    };
    global.db.data.users[m.sender] = { ...defaultUserData, ...user };
}

// Maneja datos del chat
async function handleChatData(m) {
    const chat = global.db.data.chats[m.chat] || {};
    const defaultChatData = {
        isBanned: false,
        welcome: true,
        antiLink: true,
        nsfw: true,
        autodl: false,
        detect: false,
    };
    global.db.data.chats[m.chat] = { ...defaultChatData, ...chat };
}

// Maneja configuraciones globales
async function handleSettings(m) {
    const settings = global.db.data.settings[this.user.jid] || {};
    const defaultSettings = {
        self: true,
        autoread: true,
        restrict: true,
        anticall: true,
    };
    global.db.data.settings[this.user.jid] = { ...defaultSettings, ...settings };
}

// Verifica si debe ignorar el mensaje
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
    const usedPrefix = (global.prefix || '.'); // Cambia esto según tu configuración
    const noPrefix = m.text.replace(usedPrefix, '');
    const [command, ...args] = noPrefix.trim().split(/\s+/);
    return { isCommand: m.text.startsWith(usedPrefix), usedPrefix, command, args };
}

// Busca el plugin correspondiente al comando
function findMatchingPlugin(command) {
    return Object.values(global.plugins).find(plugin =>
        Array.isArray(plugin.command)
            ? plugin.command.includes(command)
            : plugin.command === command
    );
}

// Verifica permisos y restricciones sin notificar al usuario
async function checkPermissions(m, plugin) {
    const user = global.db.data.users[m.sender];

    // Ignorar si el comando requiere ser administrador y el usuario no lo es
    if (plugin.admin && !m.isAdmin) {
        return false; // No mostrar mensaje, solo ignorar
    }

    // Ignorar si el comando requiere ser premium y el usuario no lo es
    if (plugin.premium && !user.premium) {
        return false; // No mostrar mensaje, solo ignorar
    }

    return true; // Permitir si cumple con los permisos
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
watchFile(import.meta.url, () => {
    console.log(chalk.redBright('Actualizando handler.js'));
    global.reloadHandler && global.reloadHandler();
});

