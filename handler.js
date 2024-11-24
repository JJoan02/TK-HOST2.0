import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile, readFileSync } from 'fs';
import chalk from 'chalk';
import fetch from 'node-fetch';

const { proto } = (await import('@adiwajshing/baileys')).default;

// Helper Functions
const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Stylize text using different styles.
 * @param {string} text - The text to stylize.
 * @param {number} style - The style index (1 is default).
 */
const estilo = (text, style = 1) => {
    const charMap = {
        1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890',
    };
    const baseChars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    const replacer = baseChars.split('').map((char, i) => ({
        original: char,
        convert: charMap[style][i],
    }));

    return text
        .toLowerCase()
        .split('')
        .map(char => {
            const replacement = replacer.find(x => x.original === char);
            return replacement ? replacement.convert : char;
        })
        .join('');
};

/**
 * Main handler for processing incoming messages.
 * @param {object} chatUpdate - The chat update event.
 */
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || [];
    if (!chatUpdate) return;

    this.pushMessage(chatUpdate.messages).catch(console.error);
    let m = chatUpdate.messages[chatUpdate.messages.length - 1];
    if (!m) return;

    // Ensure the database is loaded
    if (global.db.data == null) await global.loadDatabase();

    try {
        m = smsg(this, m) || m;
        if (!m) return;

        m.exp = 0;
        m.limit = false;

        // User and Chat Data Handling
        const senderId = m.sender;
        const chatId = m.chat;

        let user = global.db.data.users[senderId];
        if (!user) {
            global.db.data.users[senderId] = {
                exp: 0,
                limit: 10,
                afk: -1,
                afkReason: '',
                banned: false,
                banReason: '',
                role: 'Free user',
                autolevelup: false,
                bank: 0,
            };
        } else {
            user.exp = isNumber(user.exp) ? user.exp : 0;
            user.limit = isNumber(user.limit) ? user.limit : 10;
            user.afk = isNumber(user.afk) ? user.afk : -1;
        }

        let chat = global.db.data.chats[chatId];
        if (!chat) {
            global.db.data.chats[chatId] = {
                isBanned: false,
                welcome: true,
                autoSticker: false,
                menu: true,
                nsfw: true,
                autodl: false,
                detect: false,
                antiLink: true,
                viewonce: true,
                modoadmin: false,
                sWelcomeImageLink: getDefaultImageLink(),
                sByeImageLink: 'https://d.uguu.se/mYSkSZPR.jpg',
            };
        }

        // Command execution logic
        if (opts['self'] && !m.fromMe) return;

        m.exp += Math.ceil(Math.random() * 10);

        // Execute plugins
        const pluginDir = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
        for (let name in global.plugins) {
            let plugin = global.plugins[name];
            if (!plugin || plugin.disabled) continue;

            const pluginPath = join(pluginDir, name);
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: pluginDir, __filename: pluginPath });
                } catch (e) {
                    console.error(e);
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * Get a default random welcome image link.
 * @returns {string} - A URL string for a default welcome image.
 */
function getDefaultImageLink() {
    const links = [
        'https://pomf2.lain.la/f/onvv8i5b.jpg',
        'https://pomf2.lain.la/f/ucogaqax.jpg',
        'https://pomf2.lain.la/f/m1z5y7ju.jpg',
        'https://pomf2.lain.la/f/fqeogyqi.jpg',
    ];
    return links[Math.floor(Math.random() * links.length)];
}

/**
 * Handle participant updates in groups (e.g., add/remove).
 * @param {object} event - Participant update event.
 */
export async function participantsUpdate({ id, participants, action }) {
    if (opts['self']) return;

    let chat = global.db.data.chats[id] || {};
    if (chat.welcome) {
        for (let user of participants) {
            const text = action === 'add' ? (chat.sWelcome || 'Welcome, @user!') : (chat.sBye || 'Goodbye, @user!');
            const imageUrl = action === 'add' ? chat.sWelcomeImageLink : chat.sByeImageLink;
            this.sendFile(id, imageUrl, '', text.replace('@user', user));
        }
    }
}
