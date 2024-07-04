import { createHash } from 'crypto'; // Importa la librería para crear hashes
import fetch from 'node-fetch'; // Importa la librería para hacer solicitudes HTTP
import fs from 'fs/promises'; // Importa la librería para manejar el sistema de archivos
import path from 'path'; // Importa la librería para manejar rutas de archivos

// Expresión regular para validar la entrada de texto del usuario
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

// Función para asegurar que el directorio exista
async function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
    }
}

// Función principal del handler
let handler = async function (m, { conn, text, usedPrefix, command }) {
    // Define los códigos de idioma y sus nombres correspondientes
    let codigosIdiomas = ['es', 'en', 'pt', 'id', 'ar', 'de', 'it'];
    let nombresIdiomas = {
        'es': 'Español',
        'en': 'English',
        'pt': 'Português',
        'id': 'Bahasa Indonesia',
        'ar': 'Arab (عرب)',
        'de': 'Deutsch',
        'it': 'Italiano'
    };

    // Obtiene el ID del usuario y su foto de perfil
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => gataImg.getRandom());

    // Obtiene el tag del usuario y el identificador completo
    let tag = `${m.sender.split("@")[0]}`;
    let aa = tag + '@s.whatsapp.net';
    let user = global.db.data.users[m.sender];

    // Maneja el registro de usuarios
    if (/^(verify|verificar|reg(ister)?)$/i.test(command)) {
        // Verifica si el usuario ya está registrado
        if (user.registered === true) return m.reply('🔒 ¡Ya estás registrado! No necesitas hacerlo de nuevo.');

        // Valida el texto ingresado por el usuario
        if (!Reg.test(text)) return m.reply(`🤔 ¡Oh no! Parece que olvidaste algo. Usa el formato correcto: ${usedPrefix}${command} nombre.edad`);

        // Extrae el nombre y la edad del texto ingresado
        let [_, name, splitter, age] = text.match(Reg);
        if (!name) return m.reply('📛 ¡Ups! Necesitamos un nombre.');
        if (!age) return m.reply('🎂 ¡No olvides tu edad!');
        age = parseInt(age);
        if (age > 50) return m.reply('👴 ¡Wow! No creo que seas tan mayor.');
        if (age < 10) return m.reply('👶 ¡Oh no! Necesitas ser un poco mayor para registrarte.');
        if (name.length >= 30) return m.reply('📝 ¡El nombre es demasiado largo! Usa uno más corto.');

        // Configura los datos del usuario
        user.name = name + 'ͧͧͧͦꙶͣͤ✓ᚲᵀᴷ'.trim();
        user.age = age;
        user.GBLanguage = 'es'; // Asigna el idioma predeterminado como español
        user.regTime = +new Date;
        user.registered = true;

        // Genera un ID de registro
        let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6);

        // Mensaje de verificación humorístico
        let caption = `✅ *V E R I F I C A C I Ó N* ✅
*⎔ IDIOMA* 
• Español
*⎔ USUARIO* 
• @${tag}
*⎔ NOMBRE* 
• ${user.name}
*⎔ EDAD*
• ${user.age}
*⎔ INSIGNIA DE VERIFICACIÓN*
• 'ͧͧͧͦꙶͣͤ✓ᚲᵀᴷ' ✅
*⎔ ID DE REGISTRO*
• \`\`\`${sn}\`\`\``.trim();

        // Asegura que el directorio exista antes de guardar la imagen
        await ensureDirectoryExistence('/home/container/tmp/Admin-TK.jpg');

        // Envía el mensaje de verificación con la foto de perfil del usuario
        await conn.sendFile(m.chat, pp, 'Admin-TK.jpg', caption, m, false, { mentions: [aa] });
    }
};

// Comando que activa el handler
handler.command = /^(verify|verificar|reg(ister)?|idiomatk)$/i;

export default handler;
