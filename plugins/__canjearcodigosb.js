// plugins/canjearcodigosb.js
let handler = async (m, { conn, args }) => {
  let codigoIngresado = args[0];
  if (!codigoIngresado) throw 'Debes ingresar el código proporcionado.';

  let data = JSON.parse(fs.readFileSync('./codigos.json'));
  let codigoObj = data.codigos.find(c => c.codigo === codigoIngresado && c.usuario === m.sender);

  if (!codigoObj) throw 'Código inválido o no está asociado a tu número.';
  if (new Date() > new Date(codigoObj.expiraEn)) throw 'El código ha expirado.';

  // Generar código de vinculación
  let codigoVinculacion = generarCodigoVinculacion();
  data.codigosVinculacion.push({
    codigo: codigoVinculacion,
    usuario: m.sender,
    expiraEn: new Date(Date.now() + 5 * 60 * 1000) // Expira en 5 minutos
  });
  fs.writeFileSync('./codigos.json', JSON.stringify(data, null, 2));

  conn.sendMessage(m.chat, { text: `Tu código de vinculación es: ${codigoVinculacion}\nIngresa este código usando el comando .vincularcodigo ${codigoVinculacion}` });
};

function generarCodigoVinculacion() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

handler.command = /^canjearcodigosb$/i;
export default handler;

