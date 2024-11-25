// tasks.js
import cron from 'node-cron';
import { openDb } from './data/codigos.js';

cron.schedule('0 0 * * *', async () => {
    try {
        let db = await openDb();
        const ahora = new Date().toISOString();

        // Marcar códigos expirados
        await db.run('UPDATE codigos SET expirado = 1 WHERE expiraEn <= ?', [ahora]);

        // Eliminar vinculaciones expiradas
        await db.run('DELETE FROM vinculaciones WHERE expiraEn <= ?', [ahora]);

        console.log('Tarea programada ejecutada: Limpieza de códigos expirados.');
    } catch (error) {
        console.error('Error en la tarea programada:', error);
    }
});
