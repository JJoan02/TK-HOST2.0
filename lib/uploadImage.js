import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Upload image to telegra.ph
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * @param {Buffer} buffer Image Buffer
 * @return {Promise<string>} URL of the uploaded image
 * @throws {Error} Throws error if the upload fails or if the file type is unsupported
 */
export default async (buffer) => {
  // Detect the file type and extension
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {};
  if (!mime || !['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) {
    throw new Error('Unsupported file type. Supported types are: image/jpeg, image/jpg, image/png');
  }

  const form = new FormData();
  // Create a Blob from the buffer
  const blob = new Blob([buffer], { type: mime });
  form.append('file', blob, `tmp.${ext || 'jpg'}`); // Default to 'jpg' if ext is undefined

  // Send the POST request
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form,
  });

  // Check for response errors
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${errorText}`);
  }

  // Parse the JSON response
  const img = await res.json();
  if (img.error) {
    throw new Error(`Upload error: ${img.error}`);
  }

  // Return the URL of the uploaded image
  return 'https://telegra.ph' + img[0].src;
};
