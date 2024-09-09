const toxicRegex = /g0re|g0r3|g.o.r.e|malparido|malparida|malparidos|malparidas|m4lp4rid0|m4lp4rido|m4lparido|malp4rido|m4lparid0|malp4rid0|chup4la|chup4l4|chupalo|chup4lo|chup4l0|chupal0|chupon|chupameesta|hijodelagranputa|hijodeputa|hijadeputa|hijadelagranputa|cajetuda|laconchadedios|putita|putito|put1t4|putit4|putit0|put1to|put1ta|pr0stitut4s|pr0stitutas|pr05titutas|pr0stitut45|prostitut45|prostituta5|pr0stitut45|nepe|p3ne|p3n3|pen3|p.e.n.e|pvt0|pvto|put0|hijodelagransetentamilparesdeputa|Chingadamadre|coño|c0ño|coñ0|c0ñ0|cagon|pedorra|cagona|pinga|mamar|chigadamadre|hijueputa|chupa|caca|chupapolla|estupido|estupida|estupidos|polla|pollas|idiota|chucha|verga|vrga|zorra|zorras|pito|huevon|huevona|huevones|rctmre|mrd|cepe|sepe|sepesito|cepecito|cepesito|mamawebos|chupame|bolas|qliao|imbecil|embeciles|carajo|mierda|cerda|perra|dumb|fuck|shit|bullshit|cunt|semen|bitch|motherfucker|foker|fucking/i;

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) { 
    // Ignorar mensajes del propio bot o fuera de grupos
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    const delet = m.key.participant; // Quien envió el mensaje
    const bang = m.key.id; // ID del mensaje
    const user = global.db.data.users[m.sender]; // Usuario que envió el mensaje
    const chat = global.db.data.chats[m.chat]; // Datos del grupo
    const bot = global.db.data.settings[this.user.jid] || {}; // Configuraciones del bot
    const img = 'https://telegra.ph/file/94f45d76340fc61982bb7.jpg'; // Imagen de advertencia
    const isToxic = toxicRegex.exec(m.text); // Detectar texto tóxico
    
    // Si el mensaje es tóxico, no es de un admin/propietario y el bot tiene permisos
    if (isToxic && chat.antitoxic && !isOwner && !isAdmin && isBotAdmin) {
        // Si está activada la opción de eliminar, enviar mensaje
        if (chat.delete) return conn.reply(m.chat, "⚠️ Este bot es implacable, ¡ni lo intentes! 😈", m);
        
        // Sumar una advertencia al usuario
        user.warn += 1;
        
        // Si el usuario tiene menos de 4 advertencias, se envía una advertencia graciosa
        if (user.warn < 4) {
            await conn.reply(m.chat, `😡 ¡Hey @${m.sender.split("@")[0]}! Controla esa boca o me encargaré de que desaparezcas del mapa... 🚫 Advertencia ${user.warn}/4`, m, { mentions: [m.sender] });
            await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
        }
        
        // Si el usuario llega a 4 advertencias, se le expulsa del grupo
        if (user.warn >= 4) {
            user.warn = 0; // Reiniciar advertencias
            await conn.reply(m.chat, `🤯 ¡Eso es todo! @${m.sender.split("@")[0]} ha sido desterrado por toxicidad. ¡Que sirva de lección! 🚷`, m, { mentions: [m.sender] });
            await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            // Opcional: bloquear al usuario
            // await this.updateBlockStatus(m.sender, 'block');
        }
    }
    return false;
};

export default handler;
