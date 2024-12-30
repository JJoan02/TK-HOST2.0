let handler = async (m, { conn }) => {
  const imageUrl = 'https://pomf2.lain.la/f/fvu7rhxq.jpg'; // URL de la imagen
  const text = `
🌐 *Página Principal de TK-Host* 🖥️

🔗 [enlace Dashl]
> (https://dash.tk-joanhost.com/home)
¡Explora todo lo que puedes hacer desde nuestra pagina principal!  

📌 *Servicios disponibles*:  
- 🆕 *Registro*: Crea tu cuenta fácilmente.  
- 💻 *Crear servidores*: Configura tus propios servidores en minutos.  
- 💰 *Comprar coins*: Adquiere créditos para tus proyectos.  
- 🔧 *Gestión básica*: Ajusta configuraciones iniciales.  
- 🌟 *Promociones y planes*: Descubre ofertas especiales.

Accede ahora y comienza a disfrutar de nuestros servicios:  
  `.trim();
  await conn.sendFile(m.chat, imageUrl, 'pagina-panel.jpg', text, m);
};
handler.command = ['dash'];
handler.tags = ['pagina-panel'];
handler.help = ['dash'];
export default handler;
