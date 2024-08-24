import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { JSDOM } from 'jsdom';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';

// Generate a random filename suffix
const randomFilenameSuffix = () => crypto.randomBytes(5).toString("hex");

// Regex to validate URL
const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

/**
 * Create a FormData object for the given source
 * @param {Buffer|string} source - WebP file buffer or URL to WebP file
 * @return {Promise<FormData>} - FormData object
 */
async function createFormData(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source);
    const fileType = !isUrl ? await fileTypeFromBuffer(source) : {};
    const blob = !isUrl && new Blob([source]);
    const form = new FormData();

    form.append('new-image-url', isUrl ? source : '');
    form.append('new-image', isUrl ? '' : blob, `image.${fileType.ext || 'webp'}`);

    return form;
}

/**
 * Handle form submission and extract the result URL
 * @param {string} url - URL for the initial request
 * @param {FormData} formData - FormData object to submit
 * @param {string} resultSelector - CSS selector to find the result URL
 * @return {Promise<string>} - URL of the resulting file
 */
async function handleFormSubmission(url, formData, resultSelector) {
    let res = await fetch(url, { method: 'POST', body: formData });
    let html = await res.text();
    let { document } = new JSDOM(html).window;
    
    let form2 = new FormData();
    let obj = {};
    document.querySelectorAll('form input[name]').forEach(input => {
        obj[input.name] = input.value;
        form2.append(input.name, input.value);
    });

    let res2 = await fetch(`https://ezgif.com${obj.file}`, { method: 'POST', body: form2 });
    let html2 = await res2.text();
    let { document: finalDocument } = new JSDOM(html2).window;
    let resultElement = finalDocument.querySelector(resultSelector);
    
    if (!resultElement) {
        throw new Error('Result element not found in the response');
    }

    return new URL(resultElement.src, res2.url).toString();
}

/**
 * Convert WebP to a specified format using ezgif.com
 * @param {Buffer|string} source - WebP file buffer or URL to WebP file
 * @param {string} type - Conversion type (e.g., 'webp-to-mp4', 'webp-to-png')
 * @param {string} resultSelector - CSS selector to find the result URL
 * @return {Promise<string>} - URL of the resulting file
 */
async function convertWebP(source, type, resultSelector) {
    const form = await createFormData(source);
    return handleFormSubmission(`https://ezgif.com/${type}`, form, resultSelector);
}

/**
 * Convert WebP to MP4 with fallbacks
 * @param {Buffer|string} source - WebP file buffer or URL to WebP file
 * @return {Promise<string>} - URL of the resulting MP4 file
 */
async function webp2mp4(source) {
    const types = [
        { type: 'webp-to-mp4', selector: 'div#output > p.outfile > video > source' },
        { type: 'webp-to-avif', selector: 'div#output > p.outfile > img' },
        { type: 'webp-to-gif', selector: 'div#output > p.outfile > img' }
    ];

    for (const { type, selector } of types) {
        try {
            return await convertWebP(source, type, selector);
        } catch (error) {
            console.error(`Error converting to ${type}.`);
        }
    }

    throw new Error('All fallback conversions failed.');
}

/**
 * Convert WebP to PNG with fallbacks
 * @param {Buffer|string} source - WebP file buffer or URL to WebP file
 * @return {Promise<string>} - URL of the resulting PNG file
 */
async function webp2png(source) {
    const types = [
        { type: 'webp-to-png', selector: 'div#output > p.outfile > img' },
        { type: 'webp-to-jpg', selector: 'div#output > p.outfile > img' }
    ];

    for (const { type, selector } of types) {
        try {
            return await convertWebP(source, type, selector);
        } catch (error) {
            console.error(`Error converting to ${type}.`);
        }
    }

    throw new Error('All fallback conversions failed.');
}

export {
    webp2mp4,
    webp2png
};
