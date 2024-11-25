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
import { makeWASocket } from "./simple.js";

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
        auth: opts.authState.state,
        printQRInTerminal: false,
    });

    if (conn) Object.assign(sock, conn);
    conns.set(sock.user.jid.split("@")[0], sock);
    return sock;
}
