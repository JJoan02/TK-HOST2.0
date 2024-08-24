const stdouts = [];
let isModified = false;

/**
 * Captura y almacena la salida estándar.
 * @param {number} [maxLength=200] - Número máximo de chunks a almacenar.
 * @returns {Object} - Un objeto con métodos para gestionar la captura.
 */
export default function captureStdout(maxLength = 200) {
  const oldWrite = process.stdout.write.bind(process.stdout);

  const disable = () => {
    isModified = false;
    process.stdout.write = oldWrite;
  };

  process.stdout.write = (chunk, encoding, callback) => {
    try {
      stdouts.push(Buffer.from(chunk, encoding));
      oldWrite(chunk, encoding, callback);
      if (stdouts.length > maxLength) stdouts.shift();
    } catch (error) {
      console.error('Error capturing stdout:', error);
    }
  };

  isModified = true;
  return { disable, isModified };
}

/**
 * Obtiene el contenido capturado de stdout.
 * @returns {Buffer} - Buffer que contiene la salida estándar capturada.
 */
export function logs() {
  return Buffer.concat(stdouts);
}


