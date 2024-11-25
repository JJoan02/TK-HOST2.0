// lib/jadibot.js
import { jidNormalizedUser, areJidsSameUser } from "@adiwajshing/baileys";
import { startBot } from "./jadibots.js";
import { join } from "path";
import { existsSync, promises as fs } from "fs";

export async function Jadibot(numerxd, conn, m, usePairingCode = false) {
    numerxd = jidNormalizedUser(numerxd);
    if (!numerxd) throw new Error("Número inválido.");

    const userjb = numerxd.split('@')[0];
    const bot = await startBot(numerxd, conn, m, usePairingCode);

    if (bot?.user?.jid && !areJidsSameUser(bot.user.jid, numerxd)) {
        console.log(`Cambio de JID detectado para ${numerxd}`);
        try {
            const oldPath = join(authFolder, userjb);
            const newPath = join(authFolder, bot.user.jid.split('@')[0]);
            if (existsSync(oldPath)) await fs.rename(oldPath, newPath);
            numerxd = bot.user.jid;
        } catch (err) {
            console.error(err);
            throw new Error("Fallo al iniciar el bot.");
        }
    }
    return bot;
}

