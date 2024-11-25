// plugins/__jadibot-stop.js
import { existsSync, promises as fs } from "fs";
import { join } from "path";
import { authFolder } from "../lib/jadibots.js";

let handler = async (m, { conn }) => {
    let userId = m.sender.split("@")[0];
    const userSessionPath = join(authFolder, userId);

    try {
        if (existsSync(userSessionPath)) {
            await fs.rm(userSessionPath, { recursive: true, force: true });
            conn.sendMessage(m.chat, { text: '✦ Sub-Bot detenido y sesión eliminada exitosamente.' }, { quoted: m });
        } else {
            conn.sendMessage(m.chat, { text: 'No tienes una sesión activa de Sub-Bot.' }, { quoted: m });
        }
    } catch (err) {
        console.error(err);
        conn.sendMessage(m.chat, { text: 'Error al detener la sesión de Sub-Bot.' }, { quoted: m });
    }
};

handler.command = /^(stopjadibot|delsession|eliminarsesion)$/i;
export default handler;
