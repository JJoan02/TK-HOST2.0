// Importación de módulos necesarios de baileys
const { proto, generateWAMessage, areJidsSameUser } = (await import('@whiskeysockets/baileys')).default;

// Función principal para procesar mensajes
export async function all(m, chatUpdate) {
  try {
    // Verifica si el mensaje proviene de Baileys o si no contiene un mensaje válido
    if (m.isBaileys || !m.message) return;

    // Verifica si el mensaje es un tipo de respuesta reconocida (botón, plantilla, lista o interactivo)
    if (!(m.message.buttonsResponseMessage || m.message.templateButtonReplyMessage || m.message.listResponseMessage ||
        m.message.interactiveResponseMessage)) return;

    // Obtiene el ID del mensaje en función del tipo de respuesta
    let id = m.message.buttonsResponseMessage?.selectedButtonId || 
             m.message.templateButtonReplyMessage?.selectedId ||
             m.message.listResponseMessage?.singleSelectReply?.selectedRowId || 
             JSON.parse(m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson)?.id;

    // Obtiene el texto del mensaje en función del tipo de respuesta
    let text = m.message.buttonsResponseMessage?.selectedDisplayText || 
               m.message.templateButtonReplyMessage?.selectedDisplayText || 
               m.message.listResponseMessage?.title || 
               m.message.interactiveResponseMessage?.body?.text;

    let isIdMessage = false, usedPrefix;

    // Itera sobre los plugins globales para encontrar coincidencias con el comando
    for (let name in global.plugins) {
      let plugin = global.plugins[name];
      if (!plugin || plugin.disabled || (plugin.tags && plugin.tags.includes('admin') && !opts['restrict'])) continue;
      if (typeof plugin !== 'function' || !plugin.command) continue;

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix;
      let match = (_prefix instanceof RegExp ? [[_prefix.exec(id), _prefix]] :
                  Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(str2Regex(p)).exec(id), p instanceof RegExp ? p : new RegExp(str2Regex(p))]) :
                  typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]] :
                  [[[], new RegExp]]
                 ).find(p => p[1]);

      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = id.replace(usedPrefix, '');
        let [command] = noPrefix.trim().split(' ').filter(v => v);
        command = (command || '').toLowerCase();

        let isId = plugin.command instanceof RegExp ? plugin.command.test(command) :
                   Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                   typeof plugin.command === 'string' ? plugin.command === command : false;

        if (!isId) continue;

        isIdMessage = true;
      }
    }

    // Genera el mensaje y lo emite
    let messages = await generateWAMessage(m.chat, { text: isIdMessage ? id : text, mentions: m.mentionedJid }, {
      userJid: this.user.id,
      quoted: m.quoted?.fakeObj
    });
    messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.name;
    if (m.isGroup) messages.key.participant = messages.participant = m.sender;

    let msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)].map(v => (v.conn = this, v)),
      type: 'append'
    };
    this.ev.emit('messages.upsert', msg);

  } catch (error) {
    console.error('Error al procesar el mensaje:', error);
  }
}
