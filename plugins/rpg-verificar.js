import { createHash } from 'crypto';

let handler = async function (m, { conn, text, command, usedPrefix }) {
    let user = global.db.data.users[m.sender];
    
    if (user.registered) return conn.reply(m.chat, `Ya estás registrado!`, m);

    let [nombre, edad] = text.split(' ');

    // Si no proporciona el nombre, toma el nombre de WhatsApp
    if (!nombre) nombre = await conn.getName(m.sender);

    // Si no proporciona la edad, se establece en 18
    if (!edad) edad = 18;

    // Validaciones
    if (nombre.length > 30) return conn.reply(m.chat, `Tu nombre es muy largo. Por favor, usa un nombre más corto.`, m);
    if (isNaN(edad) || edad < 10 || edad > 90) return conn.reply(m.chat, `Por favor, proporciona una edad válida (entre 10 y 90 años).`, m);

    // Asignación de datos
    user.name = nombre;
    user.age = edad;
    user.regTime = +new Date();
    user.registered = true;

    // Generar número de serie único
    let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6);

    // Guardar el número de serie
    user.serial = sn;

    // Obtener la foto de perfil del usuario o usar una imagen predeterminada
    let pp = 'https://telegra.ph/file/74179f006d80f4bf6a50f.jpg'; // URL de una imagen predeterminada
    try {
        pp = await conn.profilePictureUrl(m.sender, 'image'); // Intenta obtener la foto de perfil del usuario
        // Verificar si la imagen obtenida es válida (puedes agregar más validaciones si es necesario)
        if (!pp) throw new Error('Imagen de perfil no disponible');
    } catch (e) {
        // Si falla al obtener la foto de perfil, usa la imagen predeterminada
        console.error(e);
    }

    // Preparar el mensaje de registro completo
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

    // Enviar mensaje de registro exitoso
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
};

handler.command = /^(reg|reg1|verificar)$/i;
export default handler;
