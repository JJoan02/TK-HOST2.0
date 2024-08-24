import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Upload ephemeral file to file.io
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>} The URL of the uploaded file
 */
const fileIO = async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {};
  const form = new FormData();
  const blob = new Blob([buffer], { type: mime });
  form.append('file', blob, `tmp.${ext || 'bin'}`);

  const res = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(`file.io upload failed with status ${res.status}`);
  
  const json = await res.json();
  if (!json.success) throw new Error(`file.io upload failed: ${json.error}`);
  
  return json.link;
};

/**
 * Upload file to storage.restfulapi.my.id
 * @param {Buffer | ReadableStream | (Buffer | ReadableStream)[]} inp File Buffer/Stream or Array of them
 * @return {Promise<string | (string | null)[]>} The URL(s) of the uploaded file(s)
 */
const RESTfulAPI = async (inp) => {
  const form = new FormData();
  let buffers = Array.isArray(inp) ? inp : [inp];
  
  for (const buffer of buffers) {
    const blob = new Blob([buffer]);
    form.append('file', blob);
  }

  const res = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(`RESTfulAPI upload failed with status ${res.status}`);
  
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!Array.isArray(buffers)) return json.files[0]?.url || null;
    return json.files.map(file => file.url || null);
  } catch (e) {
    throw new Error(`RESTfulAPI response parsing error: ${e.message}`);
  }
};

/**
 * Upload file to available services and return the file URL
 * @param {Buffer} inp File Buffer
 * @return {Promise<string>} The URL of the uploaded file
 */
export default async function uploadFile(inp) {
  let lastError;
  for (const upload of [RESTfulAPI, fileIO]) {
    try {
      return await upload(inp);
    } catch (e) {
      lastError = e;
    }
  }
  throw new Error(`All upload attempts failed: ${lastError.message}`);
}
