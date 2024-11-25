// data/codigos.js
import sqlite3 from 'sqlite3';

export async function openDb() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./data/bot.db', (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
}
