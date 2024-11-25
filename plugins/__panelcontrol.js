// plugins/__panelcontrol.js
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) throw '❌ Solo el owner puede usar este comando.';

    let db = await openDb();

    let subBotsActivos = await db.all('SELECT * FROM sesiones WHERE fin IS NULL');
    let codigosGenerados = await db.all('SELECT * FROM codigos WHERE expirado = 0');
    let historialSesiones = await db.all('SELECT * FROM sesiones ORDER BY inicio DESC LIMIT 10');

    let mensaje = '*🔹 Panel de Control 🔹*\n\n';

    mensaje += '*Sub-Bots Activos:*\n';
    for (let bot of subBotsActivos) {
        mensaje += `- @${bot.usuario.split('@')[0]} (Desde: ${new Date(bot.inicio).toLocaleString()})\n`;
    }
    if (subBotsActivos.length === 0) mensaje += 'No hay sub-bots activos.\n';

    mensaje += '\n*Codigos Generados:*\n';
    for (let codigo of codigosGenerados) {
        mensaje += `- Código: ${codigo.codigo}, Usuario: @${codigo.usuario.split('@')[0]}, Expira: ${new Date(codigo.expiraEn).toLocaleDateString()}\n`;
    }
    if (codigosGenerados.length === 0) mensaje += 'No hay códigos activos.\n';

    mensaje += '\n*Historial de Sesiones (Últimas 10):*\n';
    for (let sesion of historialSesiones) {
        mensaje += `- Usuario: @${sesion.usuario.split('@')[0]}, Inicio: ${new Date(sesion.inicio).toLocaleString()}, Fin: ${sesion.fin ? new Date(sesion.fin).toLocaleString() : 'Activo'}\n`;
    }

    await conn.sendMessage(m.chat, { text: mensaje, mentions: [] });
};

handler.command = /^panelcontrol$/i;
export default handler;
