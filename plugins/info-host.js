let handler = async (m, {
    conn
}) => {

let text = `
👋 *¡Hola, soy Admin-TK!* 🚀  

Bienvenid@ a *TK-HOST!* 🚀
Crea y aloja bots o servidores en un entorno rápido, seguro y confiable, y lleva tus proyectos al siguiente nivel.

🌐 *Acceso Rápido:*  
🔗 *Dashboard:* [Gestiona tus recursos]
(https://dash.tk-joanhost.com)  
🔗 *Panel de Control:* [Administra tu servidor]
(https://panel.tk-joanhost.com)  

✨ *¿Por qué elegir TK-HOST?*  
✔️ *Velocidad:* Nuestros servidores están optimizados para ofrecer el mejor rendimiento.  
✔️ *Confianza:* Tu proyecto siempre estará online y protegido.  
✔️ *Soporte Técnico:* Estoy aquí, junto con mi equipo, para ayudarte con cualquier duda o problema.  

📲 Si tienes preguntas o necesitas ayuda, no dudes en unirte al *Grupo Oficial*:  
👉 [Únete aquí](https://chat.whatsapp.com/EyoFXnaNujs53FBeqj2NM3)  

¡Gracias por confiar en *TK-HOST*! Con mi equipo y yo como tus aliados, no hay límites para lo que puedes lograr.`

    conn.relayMessage(m.chat, {
        extendedTextMessage: {
            text: handlers,
            contextInfo: {
                externalAdReply: {
                    title: "",
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: 'https://telegra.ph/file/c43ee155efc11b774bee3.jpg',
                    sourceUrl: ''
                }
            }, mentions: [m.sender]
        }
    }, {})

}

handler.help = ['host']
handler.tags = ['main']
handler.command = /^(host)$/i

export default handler