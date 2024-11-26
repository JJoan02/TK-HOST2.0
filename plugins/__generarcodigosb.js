import { openDb } from '../data/codigos.js';

// Function to generate a unique code
function generarCodigoUnico() {
    // Generate a unique code
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';

    for (let i = 0; i < 3; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    codigo += '-';
    for (let i = 0; i < 3; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return codigo;
}

// Main handler function
let handler = async (m, { conn, args, isOwner }) => {
    try {
        // Check if the user is the owner
        if (!isOwner) throw '*[❌] Este comando solo puede ser usado por el owner.*';

        // Check if the user mentioned is valid
        if (!m.mentionedJid || m.mentionedJid.length === 0) {
            throw '*[❌] Debes mencionar al usuario para el que deseas generar el código de vinculación.*'
        }

        // Get the mentioned user
        let usuario = m.mentionedJid[0];

        // Open the database
        let db = await openDb();

        // Generate a unique code
        let codigo = generarCodigoUnico();

        // Check if the code is unique
        let codigoObj = await db.get(`SELECT * FROM codigos WHERE codigo = ?`, [codigo]);
        if (codigoObj) {
            throw '*[❌] El código generado no es único. Por favor, inténtalo de nuevo.*'
        }

        // Insert the new code into the database
        await db.run(
            `INSERT INTO codigos (codigo, usuario, creadoEn, expiraEn, expirado) VALUES (?, ?, ?, ?, ?)`,
            [codigo, usuario, new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 0]
        );

        // Notify the owner
        conn.sendMessage(m.chat, { 
            text: `📬 *Código Generado*\n\n🔑 *Código:* ${codigo}\n🕒 *Este código expira en 30 días.*` 
        }, { quoted: m });

        // Send notification to the user
        await conn.sendMessage(usuario, {
            text: `🔑 *Has recibido un código para vincularte como Sub-Bot.*\n\n📜 *Código:* ${codigo}\n\n✅ _Usa este código con el comando_ *.canjearcodigosb ${codigo}* _para obtener tu código de vinculación._`,
        });
    catch (error) {
    console.error('❌ Error al generar el código:', error);
    let errorMessage = error.message || error.toString() || 'Ocurrió un error desconocido';
    conn.sendMessage(m.chat, { 
        text: `❌ *Error al generar el código:* ${errorMessage}` 
    }, { quoted: m });
}
    } finally {
        // No cerrar la base de datos explícitamente
    }
};

handler.help = ['generarcodigosb @usuario'];
handler.tags = ['owner'];
handler.command = /^generarcodigosb$/i;

export default handler;