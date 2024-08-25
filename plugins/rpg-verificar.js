// Importar el módulo para crear hashes criptográficos
import { createHash } from 'crypto'

// Variables globales inicializadas
let nombre = 0, edad = 0, genero = 0, bio = 0, identidad = 0, pasatiempo = 0, registro, _registro, fecha, hora, tiempo, registrando
let pas1 = 0, pas2 = 0, pas3 = 0, pas4 = 0, pas5 = 0

// Handler principal para manejar los comandos relacionados con el registro
let handler = async function (m, { conn, text, command, usedPrefix }) {
    let key 
    let sinDefinir = '😿 No encontrada' // Mensaje por defecto si no se encuentra la biografía
    let d = new Date(new Date + 3600000) // Crear una fecha con un ajuste de tiempo (1 hora adicional)
    let locale = 'es' // Idioma español
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5] // Calcular el weton (calendario javanés)
    let week = d.toLocaleDateString(locale, { weekday: 'long' }) // Día de la semana
    let date = d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) // Fecha en formato largo
    let time = d.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    }) // Hora en formato de 24 horas

    // Determinar el usuario que envió el mensaje
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    
    // Obtener la URL de la imagen de perfil del usuario
    let pp = await conn.profilePictureUrl(who, 'image').catch((_) => joanMenu)
    
    // Función para seleccionar un elemento aleatorio de una lista
    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    // Construir el nombre de WhatsApp del usuario
    let nombreWA = await usedPrefix + conn.getName(m.sender)
    
    // Acceder a la base de datos global de usuarios
    let user = global.db.data.users[m.sender]
    
    // Expresión regular para verificar el prefijo de los comandos
    let verificar = new RegExp(usedPrefix)
    
    // Obtener la biografía del usuario desde WhatsApp
    let biografia = await conn.fetchStatus(m.sender).catch(_ => 'undefined')
    bio = biografia.status?.toString() || sinDefinir
    
    let intervalId // Variable para controlar los intervalos

    // Función que maneja el proceso de registro con temporizador
    function mensajeRegistro() {
        if (edad === 0) {
            clearInterval(intervalId)    
            registrando = false
            return
        }
        if (user.registered === true) {
            return 
        }
        if (typeof genero === 'string') {
            global.db.data.users[m.sender]['registroC'] = true
            registrando = false
            conn.reply(m.chat, `*SU TIEMPO DE REGISTRO HA TERMINADO!!*\n\n_Si no continúa en este momento su registro no se guardará, si guarda más tarde su registro se habrá perdido_\n\n*Para continuar escriba:* ${usedPrefix}finalizar`, fkontak, m)
        } else {
            clearInterval(intervalId)
            global.db.data.users[m.sender]['registroR'] = true        
            registrando = false
            conn.reply(m.chat, `*SU TIEMPO DE REGISTRO HA TERMINADO!!*\n\n_Si no continúa en este momento su registro no se guardará, si guarda más tarde su registro se habrá perdido_\n\n*Para continuar escriba:* ${usedPrefix}finalizar`, fkontak, m)
        }
    }

    // Verificar si el usuario ya está registrado
    if (user.registered === true) return conn.reply(m.chat, `${lenguajeGB['smsAvisoIIG']()}*YA ESTÁ REGISTRADO!!*\n*SI QUIERE ANULAR SU REGISTRO, USE ESTE COMANDO*\n*${usedPrefix}unreg numero de serie*\n\n*SI NO RECUERDA SU NÚMERO DE SERIE, USE ESTE COMANDO*\n*${usedPrefix}myns*`, fkontak, m)    

    // Comando para iniciar el proceso de verificación o registro
    if (command == 'verificar' || command == 'verify' || command == 'register' || command == 'reg' || command == 'registrar') {
        await conn.reply(m.chat, `*👀 ¿CÓMO DESEA REGISTRARSE?*\n\n📑 **REGISTRO RÁPIDO**\n\nPara registrarse rápidamente, escriba:\n\`${usedPrefix}reg1 nombre edad\`\n\n📝 Asegúrese de dejar un espacio entre el nombre y la edad.\n\n🗂️ **REGISTRO COMPLETO**\n• Insignia de verificación\n• Desbloquear comandos que requieran registro\n• Premium Temporal Gratis\n• Más opciones disponibles\n\nPara registrarse completamente, escriba:\n\`${usedPrefix}nombre\`\n\n\`\`\`⭐ Tendrá un tiempo limitado para completar el registro\`\`\``, fkontak, m)
    }

    // Comando para registro rápido
    if (command == 'reg1' 'reg' 'verificar') {
        registrando = true
        if (registrando === true) {
            intervalId = setInterval(mensajeRegistro, 2 * 60 * 1000) // 2 min
            setTimeout(() => {
                clearInterval(intervalId)
            }, 126000) // 2.1 min
        }

        // Procesar el texto de registro
        registro = text.replace(/\s+/g, usedPrefix)
        _registro = text.split(" ", 2)
        
        // Validaciones del registro rápido
        if (!text) return conn.reply(m.chat, `${lenguajeGB['smsAvisoIIG']()}👉 *PARÁMETROS DEL REGISTRO:*\n${usedPrefix + command} nombre edad\n\n\`\`\`EJEMPLO:\`\`\`\n${usedPrefix + command} ${gt} 20\n\n*✨ CONSEJO:*\n• _Su nombre no debe de contener números_\n• _La edad no debe de contener letras_\n\n⭐ *Si desea personalizar más su registro, escriba:*\n${usedPrefix}nombre`, fkontak, m)
        
        // Validaciones para el nombre
        if (!_registro[0]) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*FALTA SU NOMBRE, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, fkontak, m)
        if (_registro[0].length >= 30) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU NOMBRE ES MUY LARGO, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, fkontak, m)
        if (_registro[0].length <= 2) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU NOMBRE ES MUY CORTO O FALTANTE, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, fkontak, m)
        
        // Eliminar espacios y números del nombre
        _registro[0] = text.replace(/\s+/g, '').replace(/[0-9]+/gi, "")
        user.name = _registro[0]

        // Validaciones para la edad
        if (!_registro[1]) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*FALTA SU EDAD, PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, fkontak, m)
        if (_registro[1] > 90) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU EDAD ES MUY MAYOR, USE OTRA EDAD POR FAVOR*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, fkontak, m)
        if (_registro[1] < 10) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU EDAD ES MUY MENOR, USE OTRA EDAD POR FAVOR*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command
                if (_registro[1] < 10) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU EDAD ES MUY MENOR, USE OTRA EDAD POR FAVOR*\n\n*PARÁMETROS DEL REGISTRO:*\n\`\`\`${usedPrefix + command} nombre edad\`\`\``, fkontak, m)

        user.age = _registro[1] // Asignar la edad al perfil del usuario

        user.regTime = + new Date // Registrar la fecha y hora del registro

        user.registered = true // Marcar al usuario como registrado
                user.registered = true // Marcar al usuario como registrado

        // Respuesta de confirmación de registro exitoso
        conn.reply(m.chat, `✅ *REGISTRO COMPLETADO CON ÉXITO*\n\n🔑 *NOMBRE:* ${user.name}\n🧬 *EDAD:* ${user.age}\n\n*Ahora puede utilizar comandos que requieren registro.*`, fkontak, m)

        // Generar un número de serie único utilizando un hash
        let sn = createHash('md5').update(m.sender).digest('hex')

        // Guardar el número de serie en el perfil del usuario
        user.serial = sn
        
        // Mostrar el número de serie al usuario
        conn.reply(m.chat, `*SU NÚMERO DE SERIE ES:*\n${sn}\n\n*Guarde este número, ya que lo necesitará para comandos futuros.*`, fkontak, m)
    }
}
    // Si el comando es 'nombre', inicia el registro completo
    if (command == 'nombre') {
        if (registrando === true) {
            intervalId = setInterval(mensajeRegistro, 2 * 60 * 1000) // Configura un temporizador para el proceso de registro
            setTimeout(() => {
                clearInterval(intervalId) // Detener el temporizador después de 2.1 minutos
            }, 126000)
        }

        // Guardar el nombre proporcionado en el perfil del usuario
        if (!text) return conn.reply(m.chat, `${lenguajeGB['smsAvisoIIG']()}*ESCRIBA SU NOMBRE, DE PREFERENCIA COMPLETO*`, fkontak, m)
        if (text.length >= 30) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU NOMBRE ES MUY LARGO, INGRESE UNO MÁS CORTO*`, fkontak, m)
        if (text.length <= 2) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU NOMBRE ES MUY CORTO O FALTANTE, INGRESE UNO VÁLIDO*`, fkontak, m)
        
        nombre = text.replace(/[0-9]+/gi, '').trim() // Eliminar números y espacios innecesarios del nombre
        conn.reply(m.chat, `${lenguajeGB['smsAvisoIIG']()}✨ *SU NOMBRE HA SIDO REGISTRADO CORRECTAMENTE*\n\n*AHORA ESCRIBA SU EDAD, DE PREFERENCIA REAL*`, fkontak, m)
    }

    // Si el comando es 'edad', se registra la edad del usuario
    if (command == 'edad') {
        if (!text) return conn.reply(m.chat, `${lenguajeGB['smsAvisoIIG']()}*ESCRIBA SU EDAD, DE PREFERENCIA REAL*`, fkontak, m)
        if (isNaN(text)) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*LA EDAD DEBE SER UN NÚMERO, INGRESE UNA VÁLIDA*`, fkontak, m)
        if (text > 90) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU EDAD ES MUY ALTA, INGRESE UNA EDAD VÁLIDA*`, fkontak, m)
        if (text < 10) return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*SU EDAD ES MUY BAJA, INGRESE UNA EDAD VÁLIDA*`, fkontak, m)
        
        edad = text // Guardar la edad proporcionada
        conn.reply(m.chat, `${lenguajeGB['smsAvisoIIG']()}✨ *SU EDAD HA SIDO REGISTRADA CORRECTAMENTE*\n\n*AHORA ESCRIBA SU GÉNERO, HOMBRE O MUJER*`, fkontak, m)
    }


    // Si el comando es 'finalizar', completa el registro del usuario
    if (command == 'finalizar') {
        if (!nombre || !edad || !genero || !bio) {
            return conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}*AÚN FALTA COMPLETAR SU REGISTRO*`, fkontak, m)
        }
        
        // Asignar los valores recopilados al perfil del usuario
        user.name = nombre
        user.age = edad
        user.gender = genero
        user.bio = bio

        user.regTime = + new Date // Registrar la fecha y hora del registro
        user.registered = true // Marcar al usuario como registrado
        
        // Enviar mensaje de confirmación del registro completo
        conn.reply(m.chat, `✅ *REGISTRO COMPLETADO CON ÉXITO*\n\n🔑 *NOMBRE:* ${user.name}\n🧬 *EDAD:* ${user.age}\n⚧️ *GÉNERO:* ${user.gender}\n📄 *BIOGRAFÍA:* ${user.bio}\n\n*Ahora puede utilizar comandos que requieren registro.*`, fkontak, m)

        // Generar un número de serie único utilizando un hash
        let sn = createHash('md5').update(m.sender).digest('hex')
        
        // Guardar el número de serie en el perfil del usuario
        user.serial = sn
        
        // Mostrar el número de serie al usuario
        conn.reply(m.chat, `*SU NÚMERO DE SERIE ES:*\n${sn}\n\n*Guarde este número, ya que lo necesitará para comandos futuros.*`, fkontak, m)
    }
}


let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6)	
registrando = false
clearInterval(intervalId)	
await conn.sendMessage(m.chat, {
text: `🍃 \`\`\`VERIFICACIÓN EXITOSA\`\`\` 🍃
*- - - - - - - - - - - - - - - - - - - - - - - - - - - -*\n
😼 *REGISTRADO POR*
❱❱ ${wm}\n
📑 *TIPO DE REGISTRO* 
❱❱ ${user.registroC === true ? 'REGISTRO RÁPIDO'}\n
⌛ *FECHA/HORA*
❱❱ ${user.tiempo}\n
🛅 *CÓDIGO DE REGISTRO*
❱❱ ${sn}\n
✅ *INSIGNIA DE VERIFICACIÓN*
❱❱   *${user.registered === true ? 'ͧͧͧͦꙶͣͤ✓ᚲᵀᴷ' : ''}*\n
✨ *NOMBRE* 
❱❱ ${user.name}\n
🔢 *EDAD* 
❱❱ ${user.age}\n
*Gracias por registrarse ✨*` : ''}`.trim(),
contextInfo: {
externalAdReply: {
title: wm,
body: user.name,
thumbnailUrl: pp, 
sourceUrl: 'https://www.atom.bio/katashifukushima/',
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}}, { quoted: fkontak })
await m.reply(`${sn}`)	
}}
handler.command = ['verify', 'verificar', 'register', 'registrar', 'reg', 'reg1', 'nombre', 'name', 'nombre2', 'name2', 'edad', 'age', 'edad2', 'age2', 'genero', 'género', 'gender', 'identidad', 'pasatiempo', 'hobby', 'identity', 'finalizar', 'pas2', 'pas3', 'pas4', 'pas5']  ///^(verify|verificar|reg(ister)?)$/i
export default handler

function pickRandom(list) { 
return list[Math.floor(Math.random() * list.length)]} 
  
const delay = (ms) => new Promise((resolve
                                   
// Exportar el manejador del comando para que pueda ser utilizado en el bot
handler.command = /^(verificar|verify|registrar|reg|register|nombre|edad|genero|bio|finalizar)$/i
export default handler
