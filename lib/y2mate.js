import fetch from 'node-fetch'; // Importa la biblioteca fetch para hacer solicitudes HTTP.
import { JSDOM } from 'jsdom'; // Importa JSDOM para manipular el contenido HTML en el servidor.

/**
 * Realiza una solicitud POST con datos del formulario.
 * @param {String} url - La URL a la que se envía la solicitud POST.
 * @param {Object} formdata - Los datos del formulario a enviar.
 * @returns {Promise} - Promesa que se resuelve con la respuesta de la solicitud.
 */
function post(url, formdata) {
  return fetch(url, {
    method: 'POST', // Método de la solicitud HTTP.
    headers: {
      'accept': '*/*', // Acepta todos los tipos de respuesta.
      'accept-language': 'en-US,en;q=0.9', // Idioma aceptado.
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', // Tipo de contenido.
    },
    body: new URLSearchParams(Object.entries(formdata)), // Convierte los datos del formulario en una cadena de parámetros URL.
  });
}

// Expresión regular para extraer el ID de video de YouTube de una URL.
const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:shorts\/)?(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;

/**
 * Descarga un video de YouTube a través de y2mate.
 * @param {String} url - URL del video de YouTube.
 * @param {String} quality - Calidad del video (disponible: `144p`, `240p`, `360p`, `480p`, `720p`, `1080p`, `1440p`, `2160p`).
 * @param {String} type - Tipo de archivo (disponible: `mp3`, `mp4`).
 * @param {String} bitrate - Bitrate del archivo (disponible para video: `144`, `240`, `360`, `480`, `720`, `1080`, `1440`, `2160`, para audio: `128`).
 * @param {String} server - Servidor a utilizar (disponible: `id4`, `en60`, `en61`, `en68`).
 * @returns {Promise<Object>} - Promesa que se resuelve con un objeto que contiene el enlace de descarga, miniatura, título y tamaño del archivo.
 */
async function yt(url, quality, type, bitrate, server = 'en68') {
  if (!ytIdRegex.test(url)) throw 'Invalid URL'; // Verifica que la URL sea válida.
  
  const ytId = ytIdRegex.exec(url); // Extrae el ID del video de YouTube de la URL.
  url = 'https://youtu.be/' + ytId[1]; // Convierte la URL al formato estándar de YouTube.
  
  // Realiza una solicitud POST para analizar el video con y2mate.
  const res = await post(`https://www.y2mate.com/mates/${server}/analyze/ajax`, {
    url,
    q_auto: 0,
    ajax: 1,
  });
  
  const json = await res.json(); // Convierte la respuesta a JSON.
  
  // Utiliza JSDOM para manipular el contenido HTML recibido.
  const { document } = (new JSDOM(json.result)).window;
  
  const tables = document.querySelectorAll('table'); // Selecciona todas las tablas en el HTML.
  const table = tables[{ mp4: 0, mp3: 1 }[type] || 0]; // Selecciona la tabla correspondiente al tipo de archivo solicitado.
  
  let list;
  switch (type) {
    case 'mp4':
      // Extrae los tamaños de archivo y calidades disponibles para videos MP4.
      list = Object.fromEntries([...table.querySelectorAll('td > a[href="#"]')]
        .filter((v) => !/\.3gp/.test(v.innerHTML))
        .map((v) => [v.innerHTML.match(/.*?(?=\()/)[0].trim(), v.parentElement.nextSibling.nextSibling.innerHTML]));
      break;
    case 'mp3':
      // Extrae el tamaño de archivo disponible para audio MP3.
      list = {
        '128kbps': table.querySelector('td > a[href="#"]').parentElement.nextSibling.nextSibling.innerHTML,
      };
      break;
    default:
      list = {};
  }
  
  // Obtiene el tamaño del archivo y otros detalles del video.
  const filesize = list[quality];
  const id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', ''];
  const thumb = document.querySelector('img').src; // Obtiene la URL de la miniatura del video.
  const title = document.querySelector('b').innerHTML; // Obtiene el título del video.
  
  // Realiza una solicitud POST para convertir el video o audio.
  const res2 = await post(`https://www.y2mate.com/mates/${server}/convert`, {
    type: 'youtube',
    _id: id[1],
    v_id: ytId[1],
    ajax: '1',
    token: '',
    ftype: type,
    fquality: bitrate,
  });
  
  const json2 = await res2.json(); // Convierte la respuesta a JSON.
  
  // Convierte el tamaño del archivo a kilobytes.
  const KB = parseFloat(filesize) * (1000 * /MB$/.test(filesize));
  
  // Devuelve un objeto con los detalles del video.
  return {
    dl_link: /<a.+?href="(.+?)"/.exec(json2.result)[1], // Enlace de descarga del video.
    thumb,
    title,
    filesizeF: filesize,
    filesize: KB,
  };
}

export default {
  yt, // Exporta la función para descargar videos de YouTube.
  ytIdRegex, // Exporta la expresión regular para extraer IDs de videos de YouTube.
  
  /**
   * Descarga un video de YouTube como audio a través de y2mate.
   * @param {String} url - URL del video de YouTube.
   * @param {String} server - Servidor a utilizar (disponible: `id4`, `en60`, `en61`, `en68`).
   * @returns {Promise<Object>} - Promesa que se resuelve con los detalles del audio descargado.
   */
  yta(url, server = 'en68') {
    return yt(url, '128kbps', 'mp3', '128', server); // Llama a la función yt con parámetros predefinidos para MP3.
  },
  
  /**
   * Descarga un video de YouTube como video a través de y2mate.
   * @param {String} url - URL del video de YouTube.
   * @param {String} server - Servidor a utilizar (disponible: `id4`, `en60`, `en61`, `en68`).
   * @returns {Promise<Object>} - Promesa que se resuelve con los detalles del video descargado.
   */
  ytv(url, server = 'en68') {
    return yt(url, '360p', 'mp4', '360', server); // Llama a la función yt con parámetros predefinidos para MP4.
  },
  
  servers: ['id4', 'en60', 'en61', 'en68'], // Lista de servidores disponibles.
};
