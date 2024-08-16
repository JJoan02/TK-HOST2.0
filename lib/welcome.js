import { DOMImplementation, XMLSerializer } from 'xmldom'; // Importa módulos para manipular XML.
import JsBarcode from 'jsbarcode'; // Importa la biblioteca para generar códigos de barras.
import { JSDOM } from 'jsdom'; // Importa JSDOM para manipular el contenido HTML en el servidor.
import { readFileSync } from 'fs'; // Importa la función para leer archivos del sistema de archivos.
import { join } from 'path'; // Importa la función para unir rutas de archivos.
import { spawn } from 'child_process'; // Importa la función para ejecutar procesos externos.

const src = join(__dirname, '..', 'src'); // Define el directorio fuente.
const _svg = readFileSync(join(src, 'welcome.svg'), 'utf-8'); // Lee el archivo SVG de plantilla.

const barcode = (data) => {
  // Genera un código de barras SVG a partir de los datos proporcionados.
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  JsBarcode(svgNode, data, {
    xmlDocument: document,
  });

  return xmlSerializer.serializeToString(svgNode); // Serializa el SVG a cadena.
};

const imageSetter = (img, value) => {
  // Establece el atributo 'xlink:href' para una imagen SVG.
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', value);
};

const textSetter = (el, value) => {
  // Establece el contenido de texto para un elemento SVG.
  el.textContent = value;
};

const { document: svg } = new JSDOM(_svg).window; // Carga el SVG de plantilla en un documento JSDOM.

const genSVG = async ({
  wid = '',
  pp = join(src, 'avatar_contact.png'),
  title = '',
  name = '',
  text = '',
  background = '',
} = {}) => {
  // Genera un SVG personalizado con los datos proporcionados.
  const el = {
    code: ['#_1661899539392 > g:nth-child(6) > image', imageSetter, toBase64(await toImg(barcode(wid.replace(/[^0-9]/g, '')), 'png'), 'image/png')],
    pp: ['#_1661899539392 > g:nth-child(3) > image', imageSetter, pp],
    text: ['#_1661899539392 > text.fil1.fnt0', textSetter, text],
    title: ['#_1661899539392 > text.fil2.fnt1', textSetter, title],
    name: ['#_1661899539392 > text.fil2.fnt2', textSetter, name],
    bg: ['#_1661899539392 > g:nth-child(2) > image', imageSetter, background],
  };
  
  // Actualiza los elementos SVG con los datos proporcionados.
  for (const [selector, set, value] of Object.values(el)) {
    set(svg.querySelector(selector), value);
  }
  
  return svg.body.innerHTML; // Devuelve el contenido HTML del SVG generado.
};

const toImg = (svg, format = 'png') => new Promise((resolve, reject) => {
  // Convierte el SVG a una imagen en el formato especificado.
  if (!svg) return resolve(Buffer.alloc(0)); // Devuelve un buffer vacío si no hay SVG.

  const bufs = [];
  const im = spawn('magick', ['convert', 'svg:-', format + ':-']); // Usa ImageMagick para convertir SVG a imagen.
  
  im.on('error', (e) => reject(e)); // Maneja errores en el proceso.
  im.stdout.on('data', (chunk) => bufs.push(chunk)); // Acumula los datos de imagen convertidos.
  im.stdin.write(Buffer.from(svg)); // Escribe el SVG al proceso.
  im.stdin.end(); // Finaliza la escritura al proceso.
  
  im.on('close', (code) => {
    if (code !== 0) reject(code); // Rechaza la promesa si el proceso termina con error.
    resolve(Buffer.concat(bufs)); // Resuelve la promesa con la imagen convertida.
  });
});

const toBase64 = (buffer, mime) => `data:${mime};base64,${buffer.toString('base64')}`;
// Convierte un buffer de imagen a una cadena Base64 con el tipo MIME especificado.

const render = async ({
  wid = '',
  pp = toBase64(readFileSync(join(src, 'avatar_contact.png')), 'image/png'),
  name = '',
  title = '',
  text = '',
  background = toBase64(readFileSync(join(src, 'Aesthetic', 'Aesthetic_000.jpeg')), 'image/jpeg'),
} = {}, format = 'png') => {
  // Renderiza un SVG personalizado y lo convierte a una imagen en el formato especificado.
  const svg = await genSVG({
    wid, pp, name, text, background, title,
  });
  return await toImg(svg, format); // Convierte el SVG a imagen y devuelve el buffer.
};

if (require.main === module) {
  // Código de prueba si el módulo es ejecutado directamente.
  render({
    wid: '1234567890',
    name: 'John Doe',
    text: 'Lorem ipsum\ndot sit color',
    title: 'grup testing',
  }, 'jpg').then((result) => {
    process.stdout.write(result); // Escribe el buffer de imagen en la salida estándar.
  });
} else {
  module.exports = render; // Exporta la función 'render' si el módulo no es ejecutado directamente.
}
