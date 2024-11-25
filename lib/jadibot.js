import { jidNormalizedUser, areJidsSameUser } from "@adiwajshing/baileys";
import { start, reload, authFolder as jbkeni } from "./jadibots.js";
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
            const oldPath = join(jbkeni, userjb);
            const newPath = join(jbkeni, bot.user.jid.split('@')[0]);
            if (existsSync(oldPath)) await fs.rename(oldPath, newPath);
            numerxd = bot.user.jid;
        } catch (err) {
            console.error(err);
            throw new Error("Fallo al iniciar el bot.");
        }
    }
    return bot;
}

async function startBot(numerojbs, conn, m, usePairingCode) {
    // Configuración del bot
    const userId = numerojbs.split("@")[0];
    const sessionPath = join(authFolder, userId);
    const authState = await useMultiFileAuthState(sessionPath);
    
    const bot = await start(null, { authState, isChild: true, usePairingCode });
    
    bot.ev.on("connection.update", async update => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                await reload(bot, true, { authState });
            } else {
                // Eliminar sesión si está desconectado
                if (existsSync(sessionPath)) await fs.rm(sessionPath, { recursive: true });
            }
        }
    });

    return bot;
}
