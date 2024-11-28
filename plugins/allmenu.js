
/**
 * allmenu.js
 * Plugin para listar todos los plugins existentes en la carpeta plugins y organizarlos en un menú por categorías.
 */

const fs = require('fs');
const path = require('path');

// Directorio de plugins
const pluginsDir = path.join(__dirname, 'plugins');

/**
 * Función para obtener todos los plugins y organizarlos por categorías
 * @returns {Object} - Un objeto con los plugins organizados por categorías
 */
function getPluginsByCategory() {
    const categories = {};

    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith('.js')) {
            const plugin = require(path.join(pluginsDir, file));
            const category = plugin.category || 'uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(plugin);
        }
    });

    return categories;
}

module.exports = {
    name: 'allmenu',
    description: 'Lista todos los plugins organizados por categorías',
    permissions: ['user'], // Todos los usuarios pueden usar este comando
    category: 'general',
    /**
     * Función de ejecución del plugin
     * @param {Object} message - El mensaje de WhatsApp
     * @param {Array} args - Argumentos del comando
     * @param {Object} client - El cliente de WhatsApp
     */
    execute(message, args, client) {
        const categories = getPluginsByCategory();
        let menu = '📜 *Menú de Plugins* 📜\n\n';

        for (const category in categories) {
            menu += `*${category.charAt(0).toUpperCase() + category.slice(1)}*:\n`;
            categories[category].forEach(plugin => {
                menu += `  - ${plugin.name}: ${plugin.description}\n`;
            });
            menu += '\n';
        }

        client.sendMessage(message.from, menu);
    }
};
