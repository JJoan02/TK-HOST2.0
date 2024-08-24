import { googleIt } from '@bochilteam/scraper';
import google from 'google-it';
import axios from 'axios';
import * as cheerio from 'cheerio'; // Cambiado para manejar correctamente el import de cheerio

const THUM_IO_URL = 'https://image.thum.io/get/fullpage/';
const GOOGLE_SEARCH_URL = 'https://google.com/search?q=';
const MENSAJE_ERROR_INPUT = 'Por favor, escribe algo para buscar.';
const MENSAJE_CARGA = '🔎 Buscando...';
const MENSAJE_ERROR_BUSQUEDA = 'Hubo un error al realizar la búsqueda.';

let handler = async (m, { conn, command, args, usedPrefix }) => {
  const fetch = (await import('node-fetch')).default;
  const textoBusqueda = args.join` `.trim();
  
  if (!textoBusqueda) {
    throw `${lenguajeGB['smsAvisoMG']()} ${MENSAJE_ERROR_INPUT}`;
  }

  m.reply(MENSAJE_CARGA);

  try {
    const urlBusqueda = GOOGLE_SEARCH_URL + encodeURIComponent(textoBusqueda);
    const resultados = await google({ query: textoBusqueda });
    
    if (!resultados.length) {
      throw new Error(MENSAJE_ERROR_BUSQUEDA);
    }
    
    let textoResultados = `🔍 Resultados para: *${textoBusqueda}*\n\n*${urlBusqueda}*\n\n`;
    resultados.forEach((res) => {
      textoResultados += `_${res.title}_\n_${res.link}_\n_${res.snippet}_\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;
    });

    const screenshotUrl = `${THUM_IO_URL}${urlBusqueda}`;
    await conn.sendFile(m.chat, screenshotUrl, 'resultados.png', textoResultados, fkontak, false, {
      contextInfo: {
        externalAdReply: {
          mediaUrl: null,
          mediaType: 1,
          description: null,
          title: gt,
          body: '💻 𝑺𝒖𝒑𝒆𝒓 𝑨𝒅𝒎𝒊𝒏-𝑻𝑲 - 𝑾𝒉𝒂𝒕𝒔𝒂𝒑𝒑',
          previewType: 0,
          thumbnail: imagen4,
          sourceUrl: accountsgb
        }
      }
    });
  } catch (error) {
    console.error(error);
    m.reply(MENSAJE_ERROR_BUSQUEDA);
  }
};

handler.help = ['google', 'googlef'].map(v => v + ' <pencarian>');
handler.tags = ['internet'];
handler.command = /^googlef?$/i;
handler.register = true;
handler.limit = 1;

export default handler;
