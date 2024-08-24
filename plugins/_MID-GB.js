import { es, en } from '../lib/multi-language/_default.js'

// Manejador que se ejecuta antes de procesar un mensaje
let handler = m => m

handler.before = async function (m, { conn }) {
    try {
        // Obtiene el idioma preferido del usuario desde la base de datos
        const user = global.db.data.users[m.sender]
        const idioma = user?.midLanguage || 'es' // Asigna 'es' si no se encuentra el idioma

        // Diccionario de idiomas disponibles
        const idiomasDisponibles = {
            'es': es,
            'en': en
        }

        // Selección del idioma basado en la preferencia del usuario
        global.mid = idiomasDisponibles[idioma] || es // Usa 'es' como predeterminado si el idioma no está en el diccionario

    } catch (error) {
        // Manejo de errores
        console.error('Error al seleccionar el idioma:', error)
        global.mid = es // Revertir a 'es' en caso de error
    }
}

export default handler
