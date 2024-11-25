// lib/jadibot.js
import { jidNormalizedUser, areJidsSameUser } from "@adiwajshing/baileys";
import { start, reload, authFolder } from "./jadibots.js";
import { join } from "path";
import { existsSync, promises as fs } from "fs";
import qrcode from 'qrcode';

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

async function startBot(numerojbs, conn, m, usePairingCode) {
    const userId = numerojbs.split("@")[0];
    const sessionPath = join(authFolder, userId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const bot = await start(null, { authState: { state, saveCreds }, isChild: true, usePairingCode });

    bot.ev.on("connection.update", async (update) => {
        const { qr, connection } = update;
        if (qr && m) {
            const qrImage = await qrcode.toBuffer(qr, { scale: 8 });
            await conn.sendMessage(m.chat, { image: qrImage, caption: 'Escanea este código QR para vincular tu sub-bot.' }, { quoted: m });
        }
        if (connection === "close") {
            const reason = bot.lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                await reload(bot, true, { authState: { state, saveCreds } });
            } else {
                if (existsSync(sessionPath)) await fs.rm(sessionPath, { recursive: true });
            }
        }
    });

    return bot;
}
