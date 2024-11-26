// plugins/__listcodigos.js
import { openDb } from '../data/codigos.js';
import { isOwner } from '../lib/permissions.js';

let handler = async (m, { conn }) => {
    if (!isOwner(m.sender)) throw '🔒 *Este comando solo puede ser usado por el owner.*';

    let db = await openDb();

    // Crear la tabla `codigos` si no existe
    await db.run(`CREATE TABLE IF NOT EXISTS codigos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL,
        usuario TEXT NOT NULL,
        creadoEn TEXT NOT NULL,
        expiraEn TEXT NOT NULL,
        expirado INTEGER DEFAULT 0,
        canjeado INTEGER DEFAULT 0
    )`);

    let codigos = await db.all('SELECT * FROM codigos WHERE expirado = 0');
    if (!codigos || codigos.length === 0) return m.reply('📭 *No hay códigos generados actualmente.*');

    let texto = '📋 *Códigos Activos de Admin-TK:* 📋\n\n';
    codigos.forEach((c, i) => {
        texto += `📝 ${i + 1}. Código: *${c.codigo}*\n👤 Usuario: @${c.usuario.split('@')[0]}\n🕒 Expira: ${new Date(c.expiraEn).toLocaleDateString()}\n\n`;
    });

    await conn.sendMessage(m.chat, { text: texto.trim(), mentions: codigos.map(c => c.usuario) });
};

handler.help = ['listcodigos'];
handler.tags = ['jadibot'];
handler.command = /^listcodigos$/i;

export default handler;
