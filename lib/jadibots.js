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
import { existsSync, promises as fs } from "fs";
import { makeWASocket } from "./simple.js";
import { openDb } from '../data/codigos.js';

export let conns = new Map();
export const authFolder = "sessions/";
export const logger = pino({ level: "silent" });

export async function generarCodigoVinculacion(usuario) {
    let codigoVinculacion = Math.floor(10000000 + Math.random() * 90000000).toString(); // Código de 8 dígitos
    let db = await openDb();

    // Guardar el código de vinculación en la base de datos
    await db.run(`INSERT INTO vinculaciones (codigoVinculacion, usuario, creadoEn, expiraEn) VALUES (?, ?, ?, ?)`, 
                 [codigoVinculacion, usuario, new Date().toISOString(), new Date(Date.now() + 5 * 60 * 1000).toISOString()]);

    return codigoVinculacion;
}

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
        const { qr, connection, lastDisconnect } = update;

        if (qr && usePairingCode && m) {
            // Generar el código de vinculación
            const codigoVinculacion = await generarCodigoVinculacion(m.sender);
            await conn.sendMessage(m.chat, {
                text: `*🍁 Código de Vinculación 🍁*\n\nTu código de vinculación es: *${codigoVinculacion}*\n\nIngresa este código en WhatsApp siguiendo las instrucciones:\n\n1. Abre WhatsApp en tu teléfono.\n2. Ve a Configuración > Dispositivos vinculados.\n3. Toca en "Vincular un dispositivo" y selecciona "Vincular con código".\n4. Ingresa el código proporcionado.\n\n*Nota:* El código expira en 5 minutos.`,
            }, { quoted: m });
        }

        if (connection === "open") {
            conns.set(bot.user.jid.split("@")[0], bot);
            await conn.sendMessage(m.chat, {
                text: '¡Has sido vinculado exitosamente como sub-bot!',
            }, { quoted: m });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                // Si no es una desconexión por logout, intentamos reconectar
                await startBot(numerojbs, conn, m, usePairingCode);
            } else {
                // Si fue logout, limpiamos la sesión
                if (existsSync(sessionPath)) await fs.rm(sessionPath, { recursive: true });
                conns.delete(userId);
            }
        }
    });

    bot.ev.on('creds.update', saveCreds);

    return bot;
}
