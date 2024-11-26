import moment from 'moment-timezone';

const renderMenuSection = (title, commands) => `
╭─❏ *${title}*
${commands.map(cmd => `┆ ➤ ${cmd}`).join('\n')}
╰───────────────
`.trim();

const createMenu = async (conn, m, taguser, greeting) => {
    const headerTemplate = `
*Hola* ${taguser} 
(ﾉ≧∇≦)ﾉ ﾐ ${greeting} Soy *Admin-TK*, tu asistente personalizado 🌟
`.trim();

    const sectionSeparator = `
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
`.trim();

    // Generar el contenido del menú
    const menu = `
${headerTemplate}

${sectionSeparator}

${renderMenuSection('Funciones AI', [
    '.hd', '.remini', '.text2img <txt>', '.blackbox <pregunta>', 
    '.aimusiclyrics', '.dalle <txt>', '.gpt <txt>'
])}

${sectionSeparator}

${renderMenuSection('Búsqueda', [
    '.applemusicsearch', '.ttiktoksearch', '.wikis', 
    '.ytslide', '.yts'
])}

${sectionSeparator}

${renderMenuSection('Descargas', [
    '.apk', '.playyt', '.mediafire', '.pinvid', 
    '.play <text>'
])}

${sectionSeparator}

${renderMenuSection('Grupos', [
    '.getpp <@tag>', '.demote @tag', '.infogc', 
    '.linkgroup', '.kick @user'
])}

${sectionSeparator}

${renderMenuSection('Herramientas', [
    '.ping', '.speed', '.smeme <txt>|<txt>', '.npmdownloader', 
    '.paste <nombre|txt>', '.qr <txt>', '.readmore <txt>|<txt>'
])}

${sectionSeparator}

${renderMenuSection('Owner', [
    '.broadcast <teks>', '.addprem <número> <días>', '.ban', 
    '.restart', '.savefile', '.getsession', '.setbio', '.update'
])}

> ©️ Admin-TK Bot 🌟
`.trim();

    await conn.sendMessage(m.chat, { text: menu });
};

const handler = async (m, { conn }) => {
    try {
        const taguser = `@${(m.sender || '').replace(/@s\.whatsapp\.net/g, '')}`;
        const time = moment.tz('America/Buenos_Aires').format('HH');
        const greeting = getGreeting(time);
        await createMenu(conn, m, taguser, greeting);
    } catch (error) {
        console.error(error);
        throw 'Hubo un error generando el menú, por favor intenta nuevamente.';
    }
};

const getGreeting = (hour) => {
    if (hour >= 5 && hour < 12) return 'Buenos Días ☀️';
    if (hour >= 12 && hour < 19) return 'Buenas Tardes 🌅';
    if (hour >= 19) return 'Buenas Noches 🌙';
    return '¿Aún despiertx?, Duerme mejor 🌙';
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'allmenu'];

export default handler;
