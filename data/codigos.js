import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

// Función para abrir la base de datos SQLite
export async function openDb() {
    // Crear el directorio `data` si no existe
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true });
    }

    try {
        // Abrir la conexión a la base de datos
        const db = await open({
            filename: './data/bot.db', // Archivo de base de datos
            driver: sqlite3.Database // Especifica el driver
        });
        return db;
    } catch (error) {
        console.error('❌ Error al abrir la base de datos:', error);
        throw error; // Propaga el error para que se gestione más arriba
    }
}
