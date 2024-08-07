const { createHash } = require('crypto');

// Función para manejar el registro rápido
async function handleQuickRegister(m, conn) {
    const keywords = ['.reg'];
    const message = m.text.toLowerCase();

    if (keywords.some(keyword => message.startsWith(keyword))) {
        const parts = message.split(' ').slice(1);
        let user = {
            name: '',
            age: '',
            descripcion: m.chat?.description || 'Descripción de WhatsApp',
            regTime: +new Date(),
            registered: true,
            tiempo: new Date().toLocaleString(),
            registroC: false
        };

        // Asignar valores según los parámetros proporcionados
        parts.forEach(part => {
            if (!isNaN(part)) {
                user.age = part;
            } else if (part.toLowerCase().startsWith('hola') || part.toLowerCase().startsWith('soy')) {
                user.descripcion = part;
            } else {
                user.name = part;
            }
        });

        // Caso: No se proporcionó nombre
        if (!user.name) {
            await conn.sendMessage(m.chat, {
                text: `😼 Parece que olvidaste proporcionar tu nombre. Por favor, intenta nuevamente con tu nombre.`,
            }, { quoted: m });
            return;
        }

        // Autocompletar la edad si no se proporcionó
        if (!user.age) {
            user.age = 18;
        }

        let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6);

        // Enviar mensaje de verificación exitosa
        const wm = 'Sempai-TK'; // Reemplaza con el nombre de tu bot
        const pp = 'URL_de_la_imagen_de_perfil'; // Reemplaza con la URL de la imagen de perfil
        const fkontak = {}; // Reemplaza con el contacto que citas

        await conn.sendMessage(m.chat, {
            text: `🍃 \\VERIFICACIÓN EXITOSA\\ 🍃
- - - - - - - - - - - - - - - - - - - - - - - - - - - -
😼 REGISTRADO POR
❱❱ ${wm}
📑 TIPO DE REGISTRO 
❱❱ ${user.registroC ? 'REGISTRO COMPLETO' : 'REGISTRO RÁPIDO'}
⌛ FECHA/HORA
❱❱ ${user.tiempo}
🛅 CÓDIGO DE REGISTRO
❱❱ ${sn}
✅ INSIGNIA DE VERIFICACIÓN
❱❱ ${user.registered ? 'ͧͧͧͦꙶͣͤ✓ᚲᵀᴷ' : ''}
✨ NOMBRE 
❱❱ ${user.name}
👀 DESCRIPCIÓN
❱❱ ${user.descripcion}
🔢 EDAD 
❱❱ ${user.age}
${user.registroC ? `☘ GÉNERO\n❱❱ ${user.genero}` : ''}`.trim(),
            contextInfo: {
                externalAdReply: {
                    title: wm,
                    body: user.name,
                    thumbnailUrl: pp,
                    sourceUrl: 'https://atom.bio/joan_tk02',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

        await m.reply(sn);
    }
}

// Ejemplo de cómo podrías usar esta función
conn.on('chat-update', async (chatUpdate) => {
    try {
        if (!chatUpdate.hasNewMessage) return;
        const m = chatUpdate.messages.all()[0];
        if (!m.message) return;
        await handleQuickRegister(m, conn);
    } catch (err) {
        console.error(err);
    }
});

