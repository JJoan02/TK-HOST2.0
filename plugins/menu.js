const handlerMenu = async (m, { conn, usedPrefix: _p, args }) => {
    try {
        const tags = {
            main: '`💎 FUNCIONES PRINCIPALES`',
            anonymous: '`🎭 CHAT ANÓNIMO`',
            ai: '`🤖 INTELIGENCIA ARTIFICIAL`',
            confesar: '`💌 CONFESIONES`',
            rpg: '`🎮 AVENTURAS Y JUEGOS`',
            fun: '`🎉 DIVERSIÓN`',
            search: '`🔍 BÚSQUEDA`',
            downloader: '`⬇️ DESCARGAS`',
            internet: '`🌐 INTERNET Y HERRAMIENTAS`',
            anime: '`🍙 ANIME`',
            nsfw: '`🔞 CONTENIDO ADULTO`',
            sticker: '`✨ CREACIÓN DE STICKERS`',
            tools: '`🔧 HERRAMIENTAS`',
            group: '`👥 CONFIGURACIÓN DE GRUPOS`',
            owner: '`👑 ADMINISTRACIÓN`',
        };

        const category = args[0]?.toLowerCase();

        if (!category) {
            // Mostrar el menú de categorías si no hay argumento
            const menuText = `
╔════════════════════════════╗
║     📜 *ɢᴜíᴀ ᴅᴇʟ ᴍᴇɴú ᴛᴋ* 📜     
╚════════════════════════════╝

👋 *ʜᴏʟᴀ, ${m.pushName || 'Usuario'}.*
ᴇɴ ᴇꜱᴛᴇ ᴍᴇɴú ᴇɴᴄᴏɴᴛʀᴀʀáꜱ ᴜɴᴀ ᴅᴇꜱᴄʀɪᴘᴄɪóɴ ᴅᴇᴛᴀʟʟᴀᴅᴀ ᴅᴇ ᴄᴀᴅᴀ ᴄᴏᴍᴀɴᴅᴏ ᴅɪꜱᴘᴏɴɪʙʟᴇ.  

🗓️ ꜰᴇᴄʜᴀ: ${new Date().toLocaleDateString()}  
⏰ ʜᴏʀᴀ: ${new Date().toLocaleTimeString()}  

🛠️ *¿ᴄóᴍᴏ ᴜꜱᴀʀ ᴇꜱᴛᴇ ᴍᴇɴú?*
1️⃣ ʙᴜꜱᴄᴀ ʟᴀ ᴄᴀᴛᴇɢᴏʀíᴀ ꜱᴇɢúɴ ᴛᴜ ɪɴᴛᴇʀéꜱ.  
2️⃣ ᴇꜱᴄʀɪʙᴇ \`.categoria\` (ᴘᴏʀ ᴇᴊᴇᴍᴘʟᴏ: \`.main\`) ᴘᴀʀᴀ ᴠᴇʀ ꜱᴜꜱ ᴄᴏᴍᴀɴᴅᴏꜱ.

📂 *Categorías disponibles:*
${Object.entries(tags).map(([key, value]) => `- ${value} (\`${_p}${key}\`)`).join('\n')}

> 👑 *ᴀᴅᴍɪɴ-ᴛᴋ ᴇꜱᴛá ꜱɪᴇᴍᴘʀᴇ ᴄᴏɴᴛɪɢᴏ.*
            `.trim();

            return m.reply(menuText);
        }

        if (category === 'allmenu') {
            // Mostrar todos los comandos
            const help = Object.values(global.plugins).filter(plugin => !plugin.disabled);
            const allCommands = help.map(plugin => plugin.help.map(cmd => `${_p}${cmd} - ${plugin.description || 'Sin descripción'}`).join('\n')).join('\n');

            return m.reply(`📜 *TODOS LOS COMANDOS DISPONIBLES* 📜\n\n${allCommands}`);
        }

        // Mostrar los comandos de una categoría específica
        if (!tags[category]) return m.reply(`Categoría no válida. Usa \`.menu\` para ver las categorías disponibles.`);

        const help = Object.values(global.plugins)
            .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes(category))
            .map(plugin => plugin.help.map(cmd => `${_p}${cmd} - ${plugin.description || 'Sin descripción'}`).join('\n')).join('\n');

        if (!help) return m.reply(`No hay comandos disponibles en la categoría \`${tags[category]}\``);

        const text = `
📂 *Categoría: ${tags[category]}*

${help}
        `.trim();

        await m.reply(text);

    } catch (error) {
        console.error(error);
        throw 'Hubo un error mostrando el menú. Por favor, intenta nuevamente.';
    }
};

handlerMenu.help = ['menu', 'allmenu'];
handlerMenu.tags = ['main'];
handlerMenu.command = ['menu', 'allmenu', ...Object.keys(tags)];

export default handlerMenu;
