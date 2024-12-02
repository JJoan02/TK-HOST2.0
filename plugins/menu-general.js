// Ubicación: plugins/menu-general.js

// Plugin para Menú General
const generalHandler = async (m, { conn }) => {
    const text = `
╔════════════════════════════╗
║     💎 *ᴍᴇɴú ꜰᴜɴᴄɪᴏɴᴇꜱ ɢᴇɴᴇʀᴀʟᴇꜱ* 💎     
╚════════════════════════════╝

📋 *Instrucciones:*
- Usa los comandos a continuación para acceder a las funciones generales.

➤ \`.generalcmd1\` - Descripción del comando 1.
➤ \`.generalcmd2\` - Descripción del comando 2.
`;
    await conn.sendMessage(m.chat, text, m);
};
generalHandler.command = ['menugeneral'];
export default generalHandler;
