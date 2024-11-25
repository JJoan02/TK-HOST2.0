// lib/jadibots.js

import {
    Browsers,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
} from "@adiwajshing/baileys";
import pino from "pino";
import { join } from "path";
import { existsSync } from "fs";
import { makeWASocket } from "./simple.js";

export let conns = new Map();
export const authFolder = "sessions/";
export const logger = pino({ level: "silent" });

export async function startBot(numerojbs, conn, m, usePairingCode) {
    const userId = numerojbs.split("@")[0];
    const sessionPath = join(authFolder, userId);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const { version } = await fetchLatestBaileysVersion();

    const socketConfig = {
        version,
        logger,
        browser: Browsers.ubuntu("Chrome"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        markOnlineOnConnect: true,
    };

    const bot = makeWASocket(socketConfig);

    bot.ev.on("connection.update", async (update) => {
        const { qr, connection } = update;

        if (qr && usePairingCode && m) {
            // Enviar el código de emparejamiento al usuario
            const pairingCode = await bot.requestPairingCode(m.sender.split('@')[0]);
            await conn.sendMessage(m.chat, {
                text: `*🍁 Código de Emparejamiento 🍁*\n\nTu código es: *${pairingCode}*\n\nIngresa este código en WhatsApp siguiendo las instrucciones:\n\n1. Abre WhatsApp en tu teléfono.\n2. Ve a Configuración > Dispositivos vinculados.\n3. Toca en "Vincular un dispositivo" y selecciona "Vincular con código".\n4. Ingresa el código proporcionado.\n\n*Nota:* El código expira en 5 minutos.`,
            }, { quoted: m });
        }

        if (connection === "open") {
            conns.set(bot.user.jid.split("@")[0], bot);
            await conn.sendMessage(m.chat, {
                text: '¡Has sido vinculado exitosamente como sub-bot!',
            }, { quoted: m });
        }

        if (connection === "close") {
            const reason = bot.lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                await startBot(numerojbs, conn, m, usePairingCode);
            } else {
                if (existsSync(sessionPath)) await fs.rm(sessionPath, { recursive: true });
                conns.delete(userId);
            }
        }
    });

    bot.ev.on('creds.update', saveCreds);

    return bot;
}
