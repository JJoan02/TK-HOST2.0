// plugins/__canjearcodigosb.js
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args }) => {
    let codigoIngresado = args[0];
    if (!codigoIngresado) throw 'Debes ingresar el código proporcionado.';

    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    let codigoObj = data.codigos.find(c => c.codigo === codigoIngresado && c.usuario === m.sender);

    if (!codigoObj) throw 'Código inválido o no está asociado a tu número.';
    if (new Date() > new Date(codigoObj.expiraEn)) throw 'El código ha expirado.';

    // Generar código de vinculación de 8 dígitos
    let codigoVinculacion = generarCodigoVinculacion();

    // Agregar el código de vinculación al array de vinculaciones
    data.vinculaciones.push({
        codigoVinculacion,
        usuario: m.sender,
        creadoEn: new Date().toISOString(),
        expiraEn: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Expira en 5 minutos
    });

    // Guardar el archivo actualizado
    writeFileSync(codigosPath, JSON.stringify(data, null, 2));

    // Enviar el código de vinculación al usuario
    await conn.sendMessage(m.chat, { text: `*🍁 Código de Vinculación 🍁*\n\nTu código de vinculación es: *${codigoVinculacion}*\n\nIngresa este código en tu WhatsApp siguiendo las instrucciones.` });

    // Opcionalmente, eliminar el código canjeado para que no pueda ser reutilizado
    data.codigos = data.codigos.filter(c => c.codigo !== codigoIngresado);
    writeFileSync(codigosPath, JSON.stringify(data, null, 2));
};

function generarCodigoVinculacion() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

handler.command = /^canjearcodigosb$/i;
export default handler;
