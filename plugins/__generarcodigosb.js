// plugins/__generarcodigosb.js

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const codigosPath = join(process.cwd(), 'data', 'codigos.json');

let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) throw '❌ Solo el owner puede usar este comando.';
    
    let user = m.mentionedJid && m.mentionedJid[0];
    if (!user) throw '❌ Debes mencionar a un usuario. Ejemplo: .generarcodigosb @usuario';

    // Generar un código único, por ejemplo, xxxx-xxxx
    let codigo = generarCodigoInicial();

    // Leer el archivo de códigos existente
    let data = JSON.parse(readFileSync(codigosPath, 'utf-8'));

    // Verificar si el usuario ya tiene un código generado
    let existingCode = data.codigos.find(c => c.usuario === user);
    if (existingCode) {
        throw '⚠️ Este usuario ya tiene un código generado. Debe canjearlo antes de generar uno nuevo.';
    }

    // Agregar el nuevo código al array de códigos
    data.codigos.push({
        codigo,
        usuario: user,
        creadoEn: new Date().toISOString(),
        expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expira en 24 horas
    });

    // Guardar el archivo actualizado
    writeFileSync(codigosPath, JSON.stringify(data, null, 2));

    // Enviar el código al usuario
    await conn.sendMessage(user, { text: `*🍁 Código de Sub-Bot 🍁*\n\nTu código es: *${codigo}*\n\nPuedes canjearlo usando el comando:\n*.canjearcodigosb ${codigo}*\n\n*Nota:* El código expira en 24 horas.` });

    // Confirmar al owner
    m.reply('✅ Código generado y enviado al usuario.');
};

function generarCodigoInicial() {
    return `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

handler.command = /^generarcodigosb$/i;
export default handler;

