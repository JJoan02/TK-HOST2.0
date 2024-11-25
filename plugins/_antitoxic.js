let badwordRegex = /g0re|g0r3|g.o.r.e|sap0|sap4|malparido|malparida|malparidos|malparidas|m4lp4rid0|m4lp4rido|m4lparido|malp4rido|m4lparid0|malp4rid0|chocha|chup4la|chup4l4|chupalo|chup4lo|chup4l0|chupal0|chupon|chupameesta|sabandija|hijodelagranputa|hijodeputa|hijadeputa|hijadelagranputa|kbron|kbrona|cajetuda|laconchadedios|putita|putito|put1t4|putit4|putit0|put1to|put1ta|pr0stitut4s|pr0stitutas|pr05titutas|pr0stitut45|prostitut45|prostituta5|pr0stitut45|fanax|f4nax|drogas|droga|dr0g4|nepe|p3ne|p3n3|pen3|p.e.n.e|pvt0|pvto|put0|hijodelagransetentamilparesdeputa|Chingadamadre|coño|c0ño|coñ0|c0ñ0|afeminado|drog4|cocaína|marihuana|chocho|chocha|cagon|pedorro|agrandado|agrandada|pedorra|cagona|pinga|joto|sape|mamar|chigadamadre|hijueputa|chupa|caca|bobo|boba|loco|loca|chupapolla|estupido|estupida|estupidos|polla|pollas|idiota|maricon|chucha|verga|vrga|naco|zorra|zorro|zorras|zorros|pito|huevon|huevona|huevones|rctmre|mrd|ctm|csm|cepe|sepe|sepesito|cepecito|cepesito|hldv|ptm|baboso|babosa|babosos|babosas|feo|fea|feos|feas|mamawebos|chupame|bolas|qliao|imbecil|embeciles|kbrones|cabron|capullo|carajo|gore|gorre|gorreo|gordo|gorda|gordos|gordas|sapo|sapa|mierda|cerdo|cerda|puerco|puerca|perra|perro|dumb|fuck|shit|bullshit|cunt|semen|bitch|motherfucker|foker|fucking/i

export function before(m, { isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return !0
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let isBadword = badwordRegex.exec(m.text)
    console.log(isBadword)

    if (chat.antiBadword && isBadword) {
        user.warning += 1
        let warningMessage = `⚠️ *Admin-TK* ⚠️\n\nPor favor, evita utilizar ese lenguaje inapropiado. Ahora tienes *${user.warning}* advertencia/s. 😔\nRecuerda que si llegas a 3 advertencias serás expulsado/a del grupo. Si eres admin y deseas desactivar esta función, usa el comando: *.disable antibadword*.`
        
        // Enviar advertencia al privado del usuario
        await this.sendMessage(m.sender, { text: warningMessage }, { quoted: m })
        
        // Eliminar el mensaje que contiene una mala palabra
        if (m.isGroup) {
            await this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } })
        }
        
        if (user.warning >= 3) {
            user.banned = false
            user.warning = 0
            if (m.isGroup) {
                if (isBotAdmin) {
                    // Notificar al usuario en privado sobre la expulsión
                    let privateRemovalMessage = `🚫 *Admin-TK* 🚫\n\nHas sido expulsado/a del grupo por acumular 3 advertencias debido al uso de lenguaje inapropiado. Por favor, respeta las normas del grupo para evitar sanciones futuras.`
                    await this.sendMessage(m.sender, { text: privateRemovalMessage })
                    
                    // Notificar en el grupo sobre la expulsión del usuario
                    let groupRemovalMessage = `🚫 *Admin-TK* 🚫\n\nEl usuario *@${m.sender.split('@')[0]}* ha sido eliminado del grupo por acumular 3 advertencias por mal lenguaje. Por favor, respeten las reglas del grupo para mantener un ambiente agradable para todos. ✨`
                    await this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
                    await m.reply(groupRemovalMessage, null, { mentions: [m.sender] })
                }
            }
        }
    }
    return !0
}
