let handler = async (m, { conn }) => {
  const imageUrls = [
    'https://pomf2.lain.la/f/ay62wjkb.jpg',
    'https://pomf2.lain.la/f/colvnnrh.jpg',
    'https://pomf2.lain.la/f/sp1ikzyi.jpg'
  ];
  const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

  const text = `
🌟 *Plan TK-Vip2* 🌟

📊 *Especificaciones del Plan*:
- *CPU*: 1.75 vCores  
- *RAM*: 1500 MB  
- *Disco*: 6000 MB  
- *Bases de datos MySQL*: 1  

📝 *Descripción*:  
Plan diseñado para bots avanzados con capacidad para manejar múltiples conexiones.

💰 *Requisitos*:
- *TK-Coins requeridos*: 250  
- *Precio total (TK-Coins)*: 500.00  

⚙️ *Características Adicionales*:
- Soporte para la creación de servidores *JavaScript*.  
- Implementación de *Prebots Oficiales*.  

📍 Consiguelo ahora
> (https://dash.tk-joanhost.com/servers/create).  

💡 ¡Lleva tu bot al siguiente nivel con el Plan TK-Vip2! 🚀
  `.trim();

  await conn.sendFile(m.chat, randomImageUrl, 'tk-vip2.jpg', text, m);
};

handler.command = ['vip2'];
handler.tags = ['planes'];
handler.help = ['vip2'];
export default handler;

