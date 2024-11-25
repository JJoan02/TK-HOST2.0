import { Browsers, useMultiFileAuthState, fetchLatestBaileysVersion } from "@adiwajshing/baileys";
import pino from "pino";
import { join } from "path";

export let conn = null;
export let conns = new Map();
export const authFolder = "sessions/";
export const logger = pino({ level: "silent" });

export async function start(conn = null, opts = {}) {
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        logger,
        browser: Browsers.ubuntu("Chrome"),
        auth: opts.authState,
    });

    if (conn) Object.assign(sock, conn);
    conns.set(sock.user.jid.split("@")[0], sock);
    return sock;
}
