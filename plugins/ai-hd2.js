import fetch from 'node-fetch';
import { uploadPomf } from '../lib/uploadImage.js';

/* ============================================================
 * 📌 Actualizado por JoanTK
 * ✦ Función: Mejora de calidad de imágenes usando Waifu2x API.
 * ✦ Descripción:
 *   Este código permite mejorar la calidad de imágenes enviadas en un chat 
 *   de WhatsApp utilizando la API Waifu2x para realizar un upscale.
 * ✦ Características:
 *   1. **Validación avanzada**:
 *      - Asegura que se responde a una imagen válida antes de continuar.
 *   2. **Flujo robusto**:
 *      - Manejo de errores mejorado con mensajes claros al usuario.
 *   3. **Mensajes personalizados**:
 *      - Confirma el estado del procesamiento con mensajes específicos.
 *   4. **Optimizaciones de eficiencia**:
 *      - Uso eficiente de funciones asíncronas para minimizar tiempo de espera.
 * ============================================================ */

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        // Identificar al usuario o responder a una imagen
        let who = m.mentionedJid && m.mentionedJid[0] 
                  ? m.mentionedJid[0] 
                  : m.fromMe 
                    ? conn.user.jid 
                    : m.sender;
                    
        let name = await conn.getName(who);
        let q = m.quoted || m; // Imagen citada o mensaje actual
        let mime = (q.msg || q).mimetype || '';

        // Validar si se responde a una imagen
        if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
            throw new Error('✧ Por favor, responde a una *Imagen* válida (JPEG o PNG).');
        }

        m.reply('✧ Procesando tu imagen para mejorar calidad... 🔄');

        // Descargar la imagen
        let media = await q.download();
        if (!media) throw new Error('✧ Error al descargar la imagen. Intenta de nuevo.');

        // Subir la imagen para obtener una URL
        let url = await uploadPomf(media);
        if (!url) throw new Error('✧ Error al subir la imagen. Revisa tu conexión.');

        // Solicitar a la API Waifu2x la mejora de calidad
        let response = await fetch(`https://api.ryzendesu.vip/api/ai/waifu2x?url=${url}`);
        if (!response.ok) {
            let errorMessage = `✧ Error al procesar la imagen: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        let hasil = await response.buffer(); // Recibir la imagen procesada en formato binario

        // Enviar la imagen mejorada al usuario
        await conn.sendFile(m.chat, hasil, 'imagen_mejorada.jpg', 
            `✧ ¡Aquí tienes tu imagen con calidad mejorada, ${name}! ✨`, m);

    } catch (error) {
        console.error('Error procesando la imagen:', error.message);

        // Manejo de errores personalizados
        if (error.message.includes('imagen')) {
            m.reply(error.message);
        } else {
            m.reply('✧ Ha ocurrido un error inesperado al procesar tu imagen. Intenta más tarde.');
        }
    }
};

// Configuración del comando
handler.help = ['hd2'];
handler.tags = ['ai'];
handler.command = /^(hd2)$/i;
handler.register = true;

export default handler;
