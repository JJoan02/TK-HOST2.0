// utils/db-utils.js
import { openDb } from '../data/codigos.js';

// Función para insertar un nuevo código en la base de datos
export async function insertarCodigo(codigo, usuario) {
    let db;
    try {
        // Abrir la base de datos
        db = await openDb();
        
        // Insertar un nuevo código en la tabla `codigos`
        await db.run(
            'INSERT INTO codigos (codigo, usuario, creadoEn, expiraEn, expirado) VALUES (?, ?, ?, ?, ?)',
            [codigo, usuario, new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 0]
        );

        console.log('✅ Código insertado correctamente.');
    } catch (error) {
        console.error('❌ Error al insertar el código:', error);
    } finally {
        // Cerrar la conexión a la base de datos si fue abierta
        if (db) {
            await db.close();
        }
    }
}
