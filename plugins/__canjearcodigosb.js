// plugins/__canjearcodigosb.js

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args }) => {
    let codigoIngresado = args[0];
    if (!codigoIngresado) throw '❌ Debes ingresar el código proporcionado. Ejemplo: .canjearcodigosb xxxx-xxxx';

    // Limpiar códigos expirados antes de proceder
    limpiarCodigosExpirados();

    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    let codigoObj = data.codigos.find(c => c.codigo === codigoIngresado && c.usuario === m.sender);

    if (!codigoObj) throw '❌ Código inválido o no está asociado a tu número.';
    if (new Date() > new Date(codigoObj.expiraEn)) {
        // Eliminar código expirado
        data.codigos = data.codigos.filter(c => c.codigo !== codigoIngresado);
        writeFileSync(codigosPath, JSON.stringify(data, null, 2));
        throw '❌ El código ha expirado.';
    }

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
    await conn.sendMessage(m.chat, { text: `*🍁 Código de Vinculación 🍁*\n\nTu código de vinculación es: *${codigoVinculacion}*\n\nIngresa este código en tu WhatsApp siguiendo las instrucciones.\n\n*Nota:* El código expira en 5 minutos.` });

    // Eliminar el código canjeado para evitar reutilización
    data.codigos = data.codigos.filter(c => c.codigo !== codigoIngresado);
    writeFileSync(codigosPath, JSON.stringify(data, null, 2));
};

function generarCodigoVinculacion() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function limpiarCodigosExpirados() {
    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));
    const ahora = new Date();

    // Eliminar códigos y vinculaciones expirados
    data.codigos = data.codigos.filter(c => new Date(c.expiraEn) > ahora);
    data.vinculaciones = data.vinculaciones.filter(v => new Date(v.expiraEn) > ahora);

    writeFileSync(codigosPath, JSON.stringify(data, null, 2));
}

handler.command = /^canjearcodigosb$/i;
export default handler;

