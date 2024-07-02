/**
 * Este script permite buscar información detallada de una dirección IP.
 * Utiliza la API de ip-api.com para obtener datos sobre la ubicación y el proveedor de la IP.
 * 
 * Código original por SoIz1 - https://github.com/SoIz1
 * Adaptado por KatashiFukushima - https://github.com/KatashiFukushima
 * Mejorado para claridad, eficacia y humor por ChatGPT
 */

import axios from 'axios'

let handler = async (m, { conn, text }) => {
  // Mensaje inicial al usuario mientras se busca la información
  await m.reply("Buscando... 📡🔍")

  // Verificar si el usuario ha ingresado una dirección IP
  if (!text) {
    // Responder con un mensaje sarcástico si no se ha ingresado una dirección IP
    return conn.reply(m.chat, "¿Te has olvidado de ingresar una dirección IP válida? 🙄🧐", m)
  }

  // Realizar una solicitud a la API para obtener información de la IP
  axios.get(`http://ip-api.com/json/${text}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,hosting,query`)
    .then((res) => {
      const data = res.data

      // Verificar si la solicitud a la API fue exitosa
      if (String(data.status) !== "success") {
        throw new Error(data.message || "Falló") // Lanzar un error si la API devuelve un fallo
      }

      // Crear el mensaje de respuesta con la información de la IP
      let ipsearch = `
📡 *Información de la IP* 📡

🌐 IP: ${data.query}
🌍 País: ${data.country}
🇨🇴 Código de País: ${data.countryCode}
🏞️ Provincia: ${data.regionName}
📌 Código de Provincia: ${data.region}
🏙️ Ciudad: ${data.city}
🗺️ Distrito: ${data.district}
📮 Código Postal: ${data.zip}
📍 Coordenadas: ${data.lat}, ${data.lon}
🕒 Zona Horaria: ${data.timezone}
🔌 ISP: ${data.isp}
🏢 Organización: ${data.org}
🔧 AS: ${data.as}
📱 Mobile: ${data.mobile ? "Sí" : "No"}
🏠 Hosting: ${data.hosting ? "Sí" : "No"}
`.trim()

      // Enviar la información de la IP al chat del usuario
      conn.reply(m.chat, ipsearch, m)
    })
    .catch((error) => {
      // Manejar cualquier error que ocurra durante la solicitud a la API
      conn.reply(m.chat, `¡Oh no! Algo salió mal: ${error.message} 😬❌`, m)
    })
}

// Ayuda para los comandos que el handler puede manejar
handler.help = ['ip', 'ipcheck', 'ipcek'].map(v => v + ' <dirección ip>')
// Etiquetas para categorizar el handler
handler.tags = ['tools']
// Comandos que activan este handler
handler.command = /^(ip|ipcheck|ipcek)$/i
// Indica que este comando solo puede ser usado por el propietario del bot
handler.owner = true

export default handler
