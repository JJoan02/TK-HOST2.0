import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * Upload image to telegra.ph
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * @param {Buffer} buffer Image Buffer
 * @return {Promise<string>}
 */
async function uploadToTelegraph(buffer) {
    console.log("Uploading to telegra.ph...");

    try {
        const { ext } = await fileTypeFromBuffer(buffer);
        const form = new FormData();
        form.append('file', buffer, 'tmp.' + ext);

        const res = await fetch('https://telegra.ph/upload', {
            method: 'POST',
            body: form
        });

        const img = await res.json();

        if (img.error) throw new Error(img.error);

        console.log("Uploaded to telegra.ph successfully!");
        return 'https://telegra.ph' + img[0].src;
    } catch (error) {
        console.error("Upload to telegra.ph failed:", error.message || error);
    }
}

/**
 * Upload to Pomf2
 * @param {Buffer} content File Buffer
 * @return {Promise<string>}
 */
async function uploadPomf(content) {
    console.log("Uploading to Pomf2...");

    try {
        const { ext, mime } = await fileTypeFromBuffer(content) || {
            ext: "bin",
            mime: "application/octet-stream"
        };

        const formData = new FormData();
        const fileName = `upload_${Date.now()}.${ext || "bin"}`;

        formData.append("files[]", Buffer.from(content), {
            filename: fileName,
            contentType: mime || "application/octet-stream"
        });

        const res = await fetch("https://pomf2.lain.la/upload.php", {
            method: "POST",
            body: formData
        });

        const json = await res.json();

        if (!json.success) {
            throw new Error(`Upload failed: ${json.error || 'Unknown error'}`);
        }

        console.log("Uploaded to Pomf2 successfully!");
        return json.files[0]?.url;
    } catch (error) {
        console.error("Upload to Pomf2 failed:", error.message || error);
    }
}

// Exportar funciones específicas y por defecto
export { uploadPomf, uploadToTelegraph };
export default uploadToTelegraph;
