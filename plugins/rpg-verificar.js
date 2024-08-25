// Importar el módulo para crear hashes criptográficos
import { createHash } from 'crypto';

// Variables globales inicializadas
let nombre = 0, edad = 0, genero = 0, bio = 0, registro, _registro, intervalId, registrando;

// Handler principal para manejar los comandos relacionados con el registro
let handler = async function (m, { conn, text, command, usedPrefix }) {
    let key;
    let sinDefinir = '😿 No encontrada'; // Mensaje por defecto si no se encuentra la biografía
    let locale = 'es'; // Idioma español

    // Determinar el usuario que envió el mensaje
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    
    // Obtener la URL de la imagen de perfil del usuario o usar una predeterminada
    let pp;
    try {
        pp = await conn.profilePictureUrl(who, 'image');
    } catch (e) {
        pp = 'https://www.example.com/default-thumbnail.jpg'; // URL de una imagen predeterminada
    }
    
    // Construir el nombre de WhatsApp del usuario
    let nombreWA = await usedPrefix + conn.getName(m.sender);
    
    // Acceder a la base de datos global de usuarios
    let user = global.db.data.users[m.sender];
    
    // Comando para iniciar el proceso de registro rápido
    if (command == 'verificar' || command == 'register' || command == 'reg' || command == 'registrar') {
        await conn.reply(m.chat, `*👀 ¿CÓMO DESEA REGISTRARSE?*\n\n📑 **REGISTRO RÁPIDO**\n\nPara registrarse rápidamente, escriba:\n\`${usedPrefix}reg1 nombre edad\`\n\n📝 Asegúrese de dejar un espacio entre el nombre y la edad.\n\n🗂️ **REGISTRO COMPLETO**\n• Insignia de verificación\n• Desbloquear comandos que requieran registro\n• Premium Temporal Gratis\n• Más opciones disponibles\n\nPara registrarse completamente, escriba:\n\`${usedPrefix}nombre\`\n\n\`\`\`⭐ Tendrá un tiempo limitado para completar el registro\`\`\``, null, m);
    }

    // Comando para registro rápido
    if (command == 'reg1' || command == 'reg' || command == 'verificar') {
        registrando = true;
        if (registrando) {
            intervalId = setInterval(() => {
                if (edad === 0) {
                    clearInterval(intervalId);
                    registrando = false;
                    return;
                }
                if (user.registered === true) {
                    return;
                }
                if (typeof genero === 'string') {
                    global.db.data.users[m.sender]['registroC'] = true;
                    registrando = false;
                    conn.reply(m.chat, `*SU TIEMPO DE REGISTRO HA TERMINADO!!*\n\n_Si no continúa en este momento su registro no se guardará, si guarda más tarde su registro se habrá perdido_\n\n*Para continuar escriba:* ${usedPrefix}finalizar`, null, m);
                } else {
                    clearInterval(intervalId);
                    global.db.data.users[m.sender]['registroR'] = true;
                    registrando = false;
                    conn.reply(m.chat, `*SU TIEMPO DE REGISTRO HA TERMINADO!!*\n\n_Si no continúa en este momento su registro no se guardará, si guarda más tarde su registro se habrá perdido_\n\n*Para continuar escriba:* ${usedPrefix}finalizar`, null, m);
                }
            }, 2 * 60 * 1000); // 2 min
            setTimeout(() => {
                clearInterval(intervalId);
            }, 126000); // 2.1 min
        }

        // Procesar el texto de registro
        registro = text.trim();
        _registro = registro.split(" ", 2);

        // Validaciones del registro rápido
        if (!_registro[0]) _registro[0] = conn.getName(m.sender); // Usar nombre de WhatsApp si no se proporciona
        if (!_registro[1]) _registro[1] = 18; // Usar edad 18 si no se proporciona

        // Validaciones para el nombre
        if (_registro[0].length >= 30) return conn.reply(m.chat, `*SU NOMBRE ES MUY LARGO, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        if (_registro[0].length <= 2) return conn.reply(m.chat, `*SU NOMBRE ES MUY CORTO O FALTANTE, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        user.name = _registro[0];

        // Validaciones para la edad
        if (isNaN(_registro[1])) return conn.reply(m.chat, `*LA EDAD DEBE SER UN NÚMERO, INGRESE UNA VÁLIDA*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        if (_registro[1] > 90) return conn.reply(m.chat, `*SU EDAD ES MUY MAYOR, USE OTRA EDAD POR FAVOR*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        if (_registro[1] < 10) return conn.reply(m.chat, `*SU EDAD ES MUY MENOR, USE OTRA EDAD POR FAVOR*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);

        user.age = _registro[1]; // Asignar la edad al perfil del usuario
        user.regTime = +new Date; // Registrar la fecha y hora del registro
        user.registered = true; // Marcar al usuario como registrado

        // Respuesta de confirmación de registro exitoso
        let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6);
        let registroCompleto = `
😼 *REGISTRADO POR*
❱❱ ${wm}\n
📑 *TIPO DE REGISTRO* 
❱❱ REGISTRO RÁPIDO\n
⌛ *FECHA/HORA*
❱❱ ${new Date(user.regTime).toLocaleString()}\n
🛅 *CÓDIGO DE REGISTRO*
❱❱ ${sn}\n
✅ *INSIGNIA DE VERIFICACIÓN*
❱❱   *${user.registered === true ? 'ͧͧͧͦꙶͣͤ✓ᚲᵀᴷ' : ''}*\n
✨ *NOMBRE* 
❱❱ ${user.name}\n
🔢 *EDAD* 
❱❱ ${user.age}\n
*🌟 Gracias por registrarse ✨*`.trim();

        await conn.sendMessage(m.chat, {
            text: registroCompleto,
            contextInfo: {
                externalAdReply: {
                    title: wm,
                    body: '🌟 Registro completado con éxito',
                    thumbnailUrl: pp, // Aquí usamos la variable `pp`
                    sourceUrl: 'https://www.atom.bio/joan_tk02/',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: null });
    }

    // Si el comando es 'nombre', inicia el registro completo
    if (command == 'nombre') {
        if (registrando) {
            intervalId = setInterval(() => {
                if (edad === 0) {
                    clearInterval(intervalId);
                    registrando = false;
                    return;
                }
                if (user.registered === true) {
                    return;
                }
                if (typeof genero === 'string') {
                    global.db.data.users[m.sender]['registroC'] = true;
                    registrando = false;
                    conn.reply(m.chat, `*SU TIEMPO DE REGISTRO HA TERMINADO!!*\n\n_Si no continúa en este momento su registro no se guardará, si guarda más tarde su registro se habrá perdido_\n\n*Para continuar escriba:* ${usedPrefix}finalizar`, null, m);
                } else {
                    clearInterval(intervalId);
                    global.db.data.users[m.sender]['registroR'] = true;
                    registrando = false;
                    conn.reply(m.chat, `*SU TIEMPO DE REGISTRO HA TERMINADO!!*\n\n_Si no continúa en este momento su registro no se guardará, si guarda más tarde su registro se habrá perdido_\n\n*Para continuar escriba:* ${usedPrefix}finalizar`, null, m);
                }
            }, 2 * 60 * 1000); // 2 min
            setTimeout(() => {
                clearInterval(intervalId);
            }, 126000); // 2.1 min
        }

        // Procesar el texto de registro
        registro = text.trim();
        _registro = registro.split(" ", 2);

        // Validaciones del registro rápido
        if (!_registro[0]) _registro[0] = conn.getName(m.sender); // Usar nombre de WhatsApp si no se proporciona
        if (!_registro[1]) _registro[1] = 18; // Usar edad 18 si no se proporciona

        // Validaciones para el nombre
        if (_registro[0].length >= 30) return conn.reply(m.chat, `*SU NOMBRE ES MUY LARGO, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        if (_registro[0].length <= 2) return conn.reply(m.chat, `*SU NOMBRE ES MUY CORTO O FALTANTE, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        user.name = _registro[0];

        // Validaciones para la edad
        if (isNaN(_registro[1])) return conn.reply(m.chat, `*LA EDAD DEBE SER UN NÚMERO, INGRESE UNA VÁLIDA*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        if (_registro[1] > 90) return conn.reply(m.chat, `*SU EDAD ES MUY MAYOR, USE OTRA EDAD POR FAVOR*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);
        if (_registro[1] < 10) return conn.reply(m.chat, `*SU EDAD ES MUY MENOR, USE OTRA EDAD POR FAVOR*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, null, m);

        user.age = _registro[1]; // Asignar la edad al perfil del usuario
        user.regTime = +new Date; // Registrar la fecha y hora del registro
        user.registered = true; // Marcar al usuario como registrado

        // Respuesta de confirmación de registro exitoso
        let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6);
        let registroCompleto = `
😼 *REGISTRADO POR*
❱❱ ${wm}\n
📑 *TIPO DE REGISTRO* 
❱❱ REGISTRO RÁPIDO\n
⌛ *FECHA/HORA*
❱❱ ${new Date(user.regTime).toLocaleString()}\n
🛅 *CÓDIGO DE REGISTRO*
❱❱ ${sn}\n
✅ *INSIGNIA DE VERIFICACIÓN*
❱❱   *${user.registered === true ? 'ͧͧͧͦꙶͣͤ✓ᚲᵀᴷ' : ''}*\n
✨ *NOMBRE* 
❱❱ ${user.name}\n
🔢 *EDAD* 
❱❱ ${user.age}\n
*🌟 Gracias por registrarse ✨*`.trim();

        await conn.sendMessage(m.chat, {
            text: registroCompleto,
            contextInfo: {
                externalAdReply: {
                    title: wm,
                    body: '🌟 Registro completado con éxito',
                    thumbnailUrl: pp, // Aquí usamos la variable `pp`
                    sourceUrl: 'https://www.atom.bio/joan_tk02/',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: null });
    }
};

// Exportar el handler para que pueda ser usado en otros archivos
export default handler;
