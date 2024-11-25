// lib/subbot.js
import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "@adiwajshing/baileys";
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

const usuario = process.argv[2]; // El JID del usuario se pasa como argumento al forkear

if (!usuario) {
    console.error('No se proporcionó un usuario para el sub-bot.');
    process.exit(1);
}

async function iniciarSubBot() {
    const authPath = `./sessions/${usuario.split('@')[0]}`;
    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveState } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: ['Sub-Bot', 'Safari', '1.0.0']
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log(`Sub-Bot para ${usuario} desconectado:`, lastDisconnect.error);
            if (shouldReconnect) {
                iniciarSubBot();
            } else {
                console.log(`Sub-Bot para ${usuario} cerró sesión.`);
                process.exit(0);
            }
        } else if (connection === 'open') {
            console.log(`Sub-Bot para ${usuario} conectado exitosamente.`);
            sock.sendMessage(usuario, { text: '🔗 *Vinculación Exitosa!* Tu sub-bot está ahora activo.' });
        }
    });

    sock.ev.on('creds.update', saveState);

    // Manejo de mensajes entrantes
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (let msg of messages) {
            if (!msg.message) continue;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            if (text) {
                console.log(`Mensaje recibido en sub-bot de ${usuario}: ${text}`);
                // Aquí puedes agregar lógica para responder automáticamente o procesar mensajes
                // Por ejemplo:
                if (text.toLowerCase() === 'hola') {
                    await sock.sendMessage(msg.key.remoteJid, { text: '¡Hola! Soy tu Sub-Bot.' });
                }
            }
        }
    });

    // Mantener el proceso activo
    process.stdin.resume();
}

iniciarSubBot();
