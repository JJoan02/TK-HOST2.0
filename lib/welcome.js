import { DOMImplementation, XMLSerializer } from 'xmldom';
import JsBarcode from 'jsbarcode';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

// Path configurations
const src = join(__dirname, '..', 'src');
const defaultAvatarPath = join(src, 'avatar_contact.png');
const defaultBackgroundPath = join(src, 'Aesthetic', 'Aesthetic_000.jpeg');

// Read SVG template
const svgTemplate = readFileSync(join(src, 'welcome.svg'), 'utf-8');

// Generate a barcode SVG
const generateBarcodeSVG = (data) => {
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  JsBarcode(svgNode, data, { xmlDocument: document });

  return xmlSerializer.serializeToString(svgNode);
};

// Helper functions
const imageSetter = (img, value) => img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', value);
const textSetter = (el, value) => el.textContent = value;

const toBase64 = (buffer, mime) => `data:${mime};base64,${buffer.toString('base64')}`;

const toImg = (svg, format = 'png') => new Promise((resolve, reject) => {
  if (!svg) return resolve(Buffer.alloc(0));
  
  const im = spawn('magick', ['convert', 'svg:-', `${format}:-`]);
  
  im.on('error', reject);
  
  const bufs = [];
  im.stdout.on('data', chunk => bufs.push(chunk));
  im.stdin.write(Buffer.from(svg));
  im.stdin.end();
  
  im.on('close', code => {
    if (code !== 0) return reject(new Error(`ImageMagick exited with code ${code}`));
    resolve(Buffer.concat(bufs));
  });
});

// Generate and modify SVG
const genSVG = async ({ wid = '', pp = defaultAvatarPath, title = '', name = '', text = '', background = defaultBackgroundPath } = {}) => {
  const { document: svg } = new JSDOM(svgTemplate).window;
  
  const el = {
    code: ['#_1661899539392 > g:nth-child(6) > image', imageSetter, toBase64(await toImg(generateBarcodeSVG(wid.replace(/[^0-9]/g, '')), 'png'), 'image/png')],
    pp: ['#_1661899539392 > g:nth-child(3) > image', imageSetter, toBase64(readFileSync(pp), 'image/png')],
    text: ['#_1661899539392 > text.fil1.fnt0', textSetter, text],
    title: ['#_1661899539392 > text.fil2.fnt1', textSetter, title],
    name: ['#_1661899539392 > text.fil2.fnt2', textSetter, name],
    bg: ['#_1661899539392 > g:nth-child(2) > image', imageSetter, toBase64(readFileSync(background), 'image/jpeg')],
  };

  Object.values(el).forEach(([selector, setter, value]) => {
    const element = svg.querySelector(selector);
    if (element) setter(element, value);
  });

  return svg.body.innerHTML;
};

// Render SVG and convert to image
const render = async ({ wid = '', pp = defaultAvatarPath, name = '', title = '', text = '', background = defaultBackgroundPath } = {}, format = 'png') => {
  const svg = await genSVG({ wid, pp, name, text, title, background });
  return await toImg(svg, format);
};

// Export or execute script
if (require.main === module) {
  render({
    wid: '1234567890',
    name: 'John Doe',
    text: 'Lorem ipsum\ndot sit color',
    title: 'Group Testing',
  }, 'jpg').then((result) => {
    process.stdout.write(result);
  }).catch(console.error);
} else {
  module.exports = render;
}

