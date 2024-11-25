// lib/jadibot.js
import { jidNormalizedUser, areJidsSameUser } from "@adiwajshing/baileys";
import { startBot } from "./jadibots.js";
import { join } from "path";
import { existsSync, promises as fs } from "fs";
import { openDb } from '../data/codigos.js';

export async function Jadibot(numerxd, conn, m, usePairingCode = false) {
    numerxd = jidNormalizedUser(numerxd);
    if (!numerxd) throw new Error("Número inválido.");

    const userjb = numerxd.split('@')[0];
    const bot = await startBot(numerxd, conn, m, usePairingCode);

    // Implementar eventos para notificaciones y registro de sesiones
    bot.ev.on('connection.update', async (update) => {
        const { connection } = update;

        let db = await openDb();

        if (connection === 'open') {
            // Notificar al owner que el sub-bot se ha conectado
            let ownerJid = 'owner_number@s.whatsapp.net'; // Reemplaza con el número del owner
            await conn.sendMessage(ownerJid, {
                text: `🔔 Sub-Bot Conectado: @${numerxd.split('@')[0]}`,
                mentions: [numerxd]
            });

            // Registrar inicio de sesión
            await db.run('INSERT INTO sesiones (usuario, inicio, fin) VALUES (?, ?, NULL)', [numerxd, new Date().toISOString()]);
        }

        if (connection === 'close') {
            // Notificar al owner que el sub-bot se ha desconectado
            let ownerJid = 'owner_number@s.whatsapp.net'; // Reemplaza con el número del owner
            await conn.sendMessage(ownerJid, {
                text: `🔔 Sub-Bot Desconectado: @${numerxd.split('@')[0]}`,
                mentions: [numerxd]
            });

            // Registrar fin de sesión
            await db.run('UPDATE sesiones SET fin = ? WHERE usuario = ? AND fin IS NULL', [new Date().toISOString(), numerxd]);
        }
    });

    return bot;
}


