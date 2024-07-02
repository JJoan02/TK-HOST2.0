export async function before(m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
  let fkontak = { 
    "key": { 
      "participants":"0@s.whatsapp.net", 
      "remoteJid": "status@broadcast", 
      "fromMe": false, 
      "id": "Halo" 
    }, 
    "message": { 
      "contactMessage": { 
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    "participant": "0@s.whatsapp.net" 
  };

  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;
  if (
    m.text.includes('serbot') || 
    m.text.includes('jadibot') || 
    m.text.includes('deletesesion') || 
    m.text.includes('estado') || 
    m.text.includes('bots') || 
    m.text.includes('contacto') || 
    m.text.includes('creador') || 
    m.text.includes('cuentastk') || 
    m.text.includes('verificar') || 
    m.text.includes('idregistro') || 
    m.text.includes('anulareg') || 
    m.text.includes('terminos') || 
    m.text.includes('términos') || 
    m.text.includes('condiciones') || 
    m.text.includes('grupostk') || 
    m.text.includes('gruposTK') || 
    m.text.includes('gruposTk') || 
    m.text.includes('grupostK') || 
    m.text.includes('estado') || 
    m.text.includes('donar') || 
    m.text.includes('cuentasTK') || 
    m.text.includes('cuentastk') || 
    m.text.includes('cuentasTk') || 
    m.text.includes('cuentastK')
  ) return !0;

  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};

  // Si el remitente es el dueño, el número del bot, Owner, o un dueño registrado, no se aplica antiPrivate
  if (isOwner || isROwner || m.sender === this.user.jid.split('@')[0]) {
    return !1;
  }

  if (bot.antiPrivate) {
    // Aquí solo ignoramos el mensaje sin enviar una advertencia
    await this.modifyChat(m.chat, 'archive');
    return !1;
  }

  return !1;
}
