/**
 * Este código se utiliza para enviar un GIF de saludo cuando el usuario utiliza comandos específicos.
 * Los comandos disponibles son: .saludar, .saludo y .hola.
 * Cuando se utiliza uno de estos comandos, el bot selecciona un GIF aleatorio de una lista predefinida y lo envía al chat.
 * 
 * Comandos disponibles:
 * - .saludar: Envía un GIF de saludo.
 * - .saludo: Envía un GIF de saludo.
 * - .hola: Envía un GIF de saludo.
 */

let handler = async (m, { conn }) => {
  // Lista de URLs de GIFs de saludo
  const gifs = [
    'https://telegra.ph/file/50eca30f45943a6db26e1.gif',
    'https://telegra.ph/file/50aa71dded2ca8fd6c5c8.gif',
    'https://telegra.ph/file/ef00deb46d8e651e51930.gif',
    'https://telegra.ph/file/1190e241a86e3c9677d63.gif',
    'https://telegra.ph/file/78af207ee1584e80b2b3c.gif',
    'https://telegra.ph/file/327a0236dbd52575c0a2b.gif',
    'https://telegra.ph/file/7c37838887adf2dda1258.gif',
    'https://telegra.ph/file/b645126ab59bbbeb1724d.gif',
    'https://telegra.ph/file/7245f7debfc1b260e4c17.gif',
    'https://telegra.ph/file/ac97ae9f977a93d75e2f1.gif',
    'https://telegra.ph/file/0dd0e5cc18594a9d0dd64.gif',
    'https://telegra.ph/file/34557cdf8f6b0eb768961.gif',
    'https://telegra.ph/file/36f715657cdc57d0deb77.gif',
    'https://telegra.ph/file/f9e051d25585d47cbe574.gif',
    'https://telegra.ph/file/cf9bd2ec8229e959c37fd.gif',
    'https://telegra.ph/file/02e94c48e06969ec73b10.gif',
    'https://telegra.ph/file/dcb1ba32ddccf3d116c21.gif',
    'https://telegra.ph/file/fc4b723ac0b7416a862ee.gif',
    'https://telegra.ph/file/ac6131f48138c9ab70a39.gif',
    'https://telegra.ph/file/e74b6b052d8782f36c81e.gif',
    'https://telegra.ph/file/337c228c8ff3f9b64d4c7.gif',
    'https://telegra.ph/file/80bee16453bfb8e29f9f5.gif',
    'https://telegra.ph/file/467ecf18fac48643d75eb.gif',
    'https://telegra.ph/file/023713e26b4604e5ccb7e.gif',
    'https://telegra.ph/file/30439fcee466b87a43e91.gif',
    'https://telegra.ph/file/3f7a3070c38bd612b8a27.gif',
    'https://telegra.ph/file/4ad4a7721e2e62b164153.gif',
    'https://telegra.ph/file/041ee1685176b454446c4.gif',
    'https://telegra.ph/file/de8e6c16cd5ceb65dbf1d.gif',
    'https://telegra.ph/file/b51962d0bfd90fd5a3625.gif',
    'https://telegra.ph/file/c8e90ddc78f9d307a1ebb.gif'
  ];

  // Selecciona un GIF aleatorio de la lista
  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

  // Envía el GIF al chat
  await conn.sendFile(m.chat, randomGif, 'saludo.gif', '¡Hola! 👋 Aquí tienes un saludo animado para alegrar tu día. 😊', m);
}

// Configuración de los comandos que activan el handler
handler.command = /^saludar|saludo|hola$/i;

export default handler;

/*
 * Explicación de los comandos:
 * - .saludar: Envía un GIF de saludo.
 * - .saludo: Envía un GIF de saludo.
 * - .hola: Envía un GIF de saludo.
 */
