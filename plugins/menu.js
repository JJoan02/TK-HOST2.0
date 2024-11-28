// Plugin 2: Menu por categoría (Mostrar menú específico de cada categoría)
const handlerCategory = async (m, { conn, usedPrefix: _p, args }) => {
    try {
        if (!args.length) {
            // Mostrar el menú de categorías
            const categoriesText = Object.keys(tags).map(tag => {
                return `➤ *${_p}menu${tag}*: ${tags[tag]}`;
            }).join('\n');

            const text = `
╔════════════════════════════╗
║      📜 *CATEGORÍAS DEL MENÚ* 📜     
╚════════════════════════════╝

${categoriesText}

🌟 Usa \`.menu <categoría>\` para ver los comandos de una categoría específica.`;

            await m.reply(text);
            return;
        }

        const category = args[0]?.toLowerCase();
        if (!tags[category]) {
            return m.reply(`Categoría no válida. Usa \`.menu\` para ver las categorías disponibles.`);
        }

        const help = Object.values(global.plugins).filter(plugins => !plugins.disabled).map(plugins => ({
            help: Array.isArray(plugins.tags) ? plugins.help : [plugins.help],
            tags: Array.isArray(plugins.tags) ? plugins.tags : [plugins.tags],
            description: plugins.description || 'Sin descripción disponible.',
            limit: plugins.limit,
            premium: plugins.premium,
        }));

        const sectionCommands = help
            .filter(plugin => plugin.tags.includes(category) && plugin.help)
            .map(plugin => plugin.help.map(cmd => defaultMenu.body
                .replace(/%cmd/g, `${_p}${cmd}`)
                .replace(/%description/g, plugin.description)
            ).join('\n')).join('\n');

        if (!sectionCommands) return m.reply(`No hay comandos disponibles en la categoría \`${tags[category]}\``);

        const text = [
            defaultMenu.header.replace(/%category/g, tags[category]),
            sectionCommands,
            defaultMenu.footer
        ].join('\n');

        await m.reply(text);
    } catch (error) {
        console.error(error);
        throw 'Hubo un error mostrando el menú de la categoría. Por favor, intenta nuevamente.';
    }
};

handlerCategory.help = ['menu'];
handlerCategory.tags = ['main'];
handlerCategory.command = ['menu', ...Object.keys(tags).map(tag => `menu${tag}`)];

export default handlerCategory;
