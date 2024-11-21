import FormData from "form-data";
import Jimp from "jimp";

/* ============================================================
 * 📌 Actualizado por JoanTK
 * ✦ Función: Mejorar la calidad de una imagen utilizando IA.
 * ✦ Descripción:
 *   Este código permite mejorar la calidad de una imagen enviada por un usuario en un grupo de WhatsApp. 
 *   El bot procesa la imagen utilizando una API externa para mejorar su resolución y claridad.
 *   La mejora se realiza en dos pasos principales:
 *   1. El usuario etiqueta o responde con una imagen.
 *   2. El bot procesa y mejora la calidad de la imagen utilizando una API de mejora de imágenes (Vyro AI).
 *   
 *   Características principales:
 *   - Verifica si el archivo es una imagen en formato JPEG o PNG.
 *   - Si ya hay un proceso activo, bloquea nuevos procesos para evitar concurrencia.
 *   - Procesamiento de imagen con la API Vyro AI.
 *   - Mensajes de retroalimentación mejorados para el usuario.
 *   - Manejo de errores para asegurar la estabilidad del código.
 * 
 * ✧ Créditos:
 *   - **Autor**: mauro
 *   - **Fecha**: [Fecha de Creación]
 * ============================================================
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    conn.hdr = conn.hdr ? conn.hdr : {};

    // Prevenir múltiples procesos en el mismo chat
    if (m.sender in conn.hdr) {
        throw m.reply("✧ Aún hay procesos en el chat >//<");
    }

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";

    // Verifica si el mime type es una imagen válida
    if (!mime) {
        throw m.reply("*✧ Etiqueta una Imagen.*");
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
        throw m.reply("*✧ Solo se aceptan imágenes en formato JPEG o PNG.*");
    } else {
        conn.hdr[m.sender] = true;
    }

    m.reply("✧ Mejorando calidad de imagen...");
    let img = await q.download?.();

    // Manejo de errores en el procesamiento de la imagen
    try {
        const enhancedImage = await processing(img, "enhance");
        conn.sendFile(m.chat, enhancedImage, "", "`✧ Listo >//<`", m);
    } catch (err) {
        console.error(err);
        m.reply("✧ Error: No se pudo mejorar la imagen, intentalo más tarde.");
    } finally {
        delete conn.hdr[m.sender];  // Eliminar la bandera de proceso activo
    }
};

handler.help = ['hd', 'remini'];
handler.tags = ['ai'];
handler.command = /^(hd|remini)$/i;
handler.register = true;
handler.disable = false;

export default handler;

// Función de procesamiento de la imagen
async function processing(urlPath, method) {
    return new Promise((resolve, reject) => {
        let Methods = ["enhance"];
        method = Methods.includes(method) ? method : Methods[0];

        let Form = new FormData();
        let scheme = `https://inferenceengine.vyro.ai/${method}`;

        Form.append("model_version", 1, {
            "Content-Transfer-Encoding": "binary",
            contentType: "multipart/form-data; charset=utf-8",
        });

        Form.append("image", Buffer.from(urlPath), {
            filename: "enhance_image_body.jpg",
            contentType: "image/jpeg",
        });

        // Realiza la solicitud de procesamiento de la imagen
        Form.submit(
            {
                url: scheme,
                host: "inferenceengine.vyro.ai",
                path: `/${method}`,
                protocol: "https:",
                headers: {
                    "User-Agent": "okhttp/4.9.3",
                    Connection: "Keep-Alive",
                    "Accept-Encoding": "gzip",
                },
            },
            (err, res) => {
                if (err) return reject(err);

                let data = [];
                res.on("data", (chunk) => {
                    data.push(chunk);
                });

                res.on("end", () => {
                    resolve(Buffer.concat(data));  // Devuelve la imagen procesada
                });

                res.on("error", (e) => {
                    reject(e);
                });
            }
        );

        // Timeout en caso de que el procesamiento tarde demasiado
        setTimeout(() => {
            reject("✧ El procesamiento está tomando más tiempo de lo esperado, por favor inténtalo más tarde.");
        }, 30000); // Timeout de 30 segundos
    });
}
