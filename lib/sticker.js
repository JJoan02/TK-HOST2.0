import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import fluent_ffmpeg from 'fluent-ffmpeg';
import { fileTypeFromBuffer } from 'file-type';
import webp from 'node-webpmux';
import fetch from 'node-fetch';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Convert an image or video to a WebP sticker.
 * @param {Buffer} img - The image or video buffer.
 * @param {string} [url] - The URL of the image or video (optional).
 * @returns {Promise<Buffer>} - The resulting WebP sticker buffer.
 */
async function sticker6(img, url) {
    try {
        if (url) {
            const res = await fetch(url);
            if (!res.ok) throw new Error(await res.text());
            img = await res.buffer();
        }

        const type = (await fileTypeFromBuffer(img)) || { mime: 'application/octet-stream', ext: 'bin' };
        if (type.ext === 'bin') throw new Error('Unknown file type.');

        const tmp = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`);
        const out = path.join(tmp + '.webp');
        await fs.promises.writeFile(tmp, img);

        const Fffmpeg = fluent_ffmpeg(tmp).inputFormat(type.ext);
        Fffmpeg.on('error', async (err) => {
            console.error('FFmpeg error:', err);
            await fs.promises.unlink(tmp);
            throw err;
        })
        .on('end', async () => {
            await fs.promises.unlink(tmp);
            let resultSticker = await fs.promises.readFile(out);
            if (resultSticker.length > 1_000_000) {
                resultSticker = await sticker6_compress(resultSticker);
            }
            resolve(resultSticker);
        })
        .addOutputOptions([
            `-vcodec libwebp`,
            `-vf scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
        ])
        .toFormat('webp')
        .save(out);
    } catch (error) {
        throw error;
    }
}

/**
 * Compress a WebP sticker to a smaller resolution.
 * @param {Buffer} img - The image buffer.
 * @param {string} [url] - The URL of the image (optional).
 * @returns {Promise<Buffer>} - The compressed WebP sticker buffer.
 */
async function sticker6_compress(img, url) {
    try {
        if (url) {
            const res = await fetch(url);
            if (!res.ok) throw new Error(await res.text());
            img = await res.buffer();
        }

        const type = (await fileTypeFromBuffer(img)) || { mime: 'application/octet-stream', ext: 'bin' };
        if (type.ext === 'bin') throw new Error('Unknown file type.');

        const tmp = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`);
        const out = path.join(tmp + '.webp');
        await fs.promises.writeFile(tmp, img);

        const Fffmpeg = fluent_ffmpeg(tmp).inputFormat(type.ext);
        Fffmpeg.on('error', async (err) => {
            console.error('FFmpeg error:', err);
            await fs.promises.unlink(tmp);
            throw err;
        })
        .on('end', async () => {
            await fs.promises.unlink(tmp);
            resolve(await fs.promises.readFile(out));
        })
        .addOutputOptions([
            `-vcodec libwebp`,
            `-vf scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=15,pad=224:224:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
        ])
        .toFormat('webp')
        .save(out);
    } catch (error) {
        throw error;
    }
}

/**
 * Create a WhatsApp sticker with metadata.
 * @param {Buffer} img - The image buffer.
 * @param {string} url - The URL of the image (optional).
 * @param {string} packname - The sticker pack name.
 * @param {string} author - The author of the sticker pack.
 * @param {string[]} [categories=[]] - The categories for the sticker pack.
 * @param {Object} [extra={}] - Additional metadata.
 * @returns {Promise<Buffer>} - The sticker buffer with metadata.
 */
async function sticker5(img, url, packname, author, categories = [], extra = {}) {
    const { Sticker } = await import('wa-sticker-formatter');
    return new Sticker(img ? img : url)
        .setPack(packname)
        .setAuthor(author)
        .setQuality(10)
        .toBuffer();
}

/**
 * Add WhatsApp JSON Exif Metadata to a WebP sticker.
 * @param {Buffer} webpSticker - The WebP sticker buffer.
 * @param {string} packname - The sticker pack name.
 * @param {string} author - The author of the sticker pack.
 * @param {string[]} [categories=[]] - The categories for the sticker pack.
 * @param {Object} [extra={}] - Additional metadata.
 * @returns {Promise<Buffer>} - The WebP sticker with added EXIF metadata.
 */
async function addExif(webpSticker, packname, author, categories = [], extra = {}) {
    const img = new webp.Image();
    const stickerPackId = crypto.randomBytes(32).toString('hex');
    const json = {
        'sticker-pack-id': stickerPackId,
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        emojis: categories,
        ...extra,
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    await img.load(webpSticker);
    img.exif = exif;
    return await img.save(null);
}

/**
 * Convert an image or video to a sticker with error handling.
 * @param {Buffer} img - The image or video buffer.
 * @param {string} [url] - The URL of the image or video (optional).
 * @param {...string} args - Additional arguments for sticker creation.
 * @returns {Promise<Buffer|Error>} - The resulting sticker buffer or an error.
 */
async function sticker(img, url, ...args) {
    let lastError;
    for (const func of [
        global.support.ffmpeg && sticker6,
        sticker5
    ].filter(Boolean)) {
        try {
            console.log(`Executing method: ${func.name}`);
            const stickerBuffer = await func(img, url, ...args);
            if (stickerBuffer.includes('html')) continue;
            if (stickerBuffer.includes('WEBP')) {
                return await addExif(stickerBuffer, ...args);
            }
            throw new Error('Invalid sticker format.');
        } catch (err) {
            lastError = err;
        }
    }
    console.error('Error generating sticker:', lastError);
    return lastError;
}

const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false,
};

export { sticker, sticker6, addExif, support };
