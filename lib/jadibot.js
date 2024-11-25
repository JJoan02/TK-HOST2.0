bot.ev.on('connection.update', async (update) => {
    const { connection } = update;

    let db = await openDb();

    if (connection === 'open') {
        let ownerJid = 'owner_number@s.whatsapp.net'; // Reemplaza con el número del owner
        await conn.sendMessage(ownerJid, {
            text: `🔔 *Sub-Bot Vinculado Exitosamente*\n\n📌 Usuario: @${numerxd.split('@')[0]} ahora está conectado.`,
            mentions: [numerxd],
        });

        // Registrar inicio de sesión
        await db.run('INSERT INTO sesiones (usuario, inicio, fin) VALUES (?, ?, NULL)', [numerxd, new Date().toISOString()]);
    }

    if (connection === 'close') {
        let ownerJid = 'owner_number@s.whatsapp.net';
        await conn.sendMessage(ownerJid, {
            text: `🔕 *Sub-Bot Desconectado*\n\n📌 Usuario: @${numerxd.split('@')[0]} se ha desconectado.`,
            mentions: [numerxd],
        });

        // Registrar fin de sesión
        await db.run('UPDATE sesiones SET fin = ? WHERE usuario = ? AND fin IS NULL', [new Date().toISOString(), numerxd]);
    }
});
