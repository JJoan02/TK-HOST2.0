import moment from 'moment-timezone';

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

const defaultMenu = {
    before: `
╔════════════════════════════╗
║     📜 **GUÍA DEL MENÚ TK** 📜     
╚════════════════════════════╝

👋 *Hola, %names*.  
En este menú encontrarás una descripción detallada de cada comando disponible en la *Comunidad TK*.  

🗓️ Fecha: %date  
⏰ Hora: %time  
👥 Usuarios registrados: %totalreg  

🛠️ **¿Cómo usar este menú?**
1️⃣ Lee cada categoría y familiarízate con su propósito.  
2️⃣ Busca los comandos disponibles en cada sección.  
3️⃣ Usa el prefijo adecuado antes de cada comando (por ejemplo: `!comando`).  
4️⃣ Sigue las instrucciones para obtener el mejor resultado.

📝 _Consulta esta guía siempre que necesites orientación._  
%readmore
`.trimStart(),
    header: `
╭───✦ *%category* ✦───╮`,
    body: `
➤ %cmd  
💡 *Descripción*: %description  
🔒 *Restricciones*: %islimit  
🌟 *Exclusivo*: %isPremium`,
    footer: `
╰──────────────╯  
✨ _Consulta más categorías para explorar todas las funciones disponibles._ ✨`,
    after: `
🌐 **Comunidad TK: Más que un bot, somos un equipo.**  
👑 *Admin-TK te orienta hacia el uso correcto y seguro del sistema.*`,
};

const handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        const name = m.sender;
        const taguser = `@${(m.sender || '').replace(/@s\.whatsapp\.net/g, '')}`;
        const names = await conn.getName(m.sender);
        const d = new Date();
        const locale = 'es';
        const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        const totalreg = Object.keys(global.db.data.users).length;

        const help = Object.values(global.plugins)
            .filter((plugins) => !plugins.disabled)
            .map((plugins) => ({
                help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
                tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
                description: plugins.description || 'Sin descripción',
                limit: plugins.limit,
                premium: plugins.premium,
            }));

        const menuSections = Object.keys(tags)
            .map((tag) => {
                const sectionCommands = help
                    .filter((plugin) => plugin.tags.includes(tag) && plugin.help)
                    .map((plugin) =>
                        plugin.help
                            .map((cmd) =>
                                defaultMenu.body
                                    .replace(/%cmd/g, `${_p}${cmd}`)
                                    .replace(/%description/g, plugin.description)
                                    .replace(/%islimit/g, plugin.limit ? 'Requiere límite' : 'Sin restricciones')
                                    .replace(/%isPremium/g, plugin.premium ? 'Solo para usuarios Premium' : 'Disponible para todos')
                            )
                            .join('\n')
                    )
                    .join('\n');
                if (!sectionCommands) return '';
                return (
                    defaultMenu.header.replace(/%category/g, tags[tag]) +
                    '\n' +
                    sectionCommands +
                    '\n' +
                    defaultMenu.footer
                );
            })
            .filter((v) => v)
            .join('\n\n');

        const text = [
            defaultMenu.before,
            menuSections,
            defaultMenu.after,
        ]
            .join('\n')
            .replace(/%names/g, names)
            .replace(/%time/g, time)
            .replace(/%date/g, date)
            .replace(/%totalreg/g, totalreg);

        const imageUrl = 'https://pomf2.lain.la/f/ucogaqax.jpg'; // Cambia esta URL por la imagen que quieras usar

        await conn.sendFile(m.chat, imageUrl, 'menu.jpg', text.trim(), m);
    } catch (error) {
        console.error(error);
        throw 'Lo siento, hubo un error generando el menú. Intenta de nuevo.';
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu'];

export default handler;
