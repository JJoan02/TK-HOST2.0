let handler = async (m, { conn }) => {
    const message = `
🌟 *Bienvenidos a Lexa Bloom* 🌟

🔞 **Contenido Exclusivo y Personalizado** 🔞  
Explora nuestra variedad de servicios exclusivos y personalizados:

📸 **Fotos:**
- **Fotos en hilo:** $1 (4 soles).  
  > _.fhilo_  
- **Fotos del pecho:** $3 (12 soles).  
  > _.fpecho_  
- **Fotos de muslos:** $3 (12 soles).  
  > _.fmuslos_  
- **Fotos de piernas abiertas:** $5 (20 soles).  
  > _.fpabiertas_  
- **Fotos completas con una pose:** $8 (32 soles).  
  > _.fpose_  
- **Fotos personalizadas con tu nombre:** $10 (40 soles).  
  > _.fpersonalizada_

🎥 **Videos:**
- **Videos cortos (1 minuto):** $4 (16 soles).  
  > _.vcorto_  
- **Videos largos (hasta 10 minutos):** $10 (40 soles).  
  > _.vlargo_  
- **Videos personalizados (nombre y temática):** $15 (60 soles).  
  > _.vpersonalizado_  
- **Video bailando en lencería:** $7 (28 soles).  
  > _.vlenceria_  
- **Video modelando poses específicas:** $12 (48 soles).  
  > _.vposes_  
- **Video con enfoque en piernas o muslos:** $8 (32 soles).  
  > _.vpmuslos_  
- **Video íntimo (con enfoque sugerido):** $20 (80 soles).  
  > _.vintimo_  

💬 **Cómo funciona:**
1. Elige el contenido que deseas.
2. Realiza el pago vía Yape o tu método preferido. 💜
3. Envíanos tu captura del pago al contacto proporcionado.

🎁 **Promociones:**  
¡Consulta nuestras ofertas especiales para clientes frecuentes!  

📌 **Nota:**  
El pago es 100% seguro, y garantizamos la entrega discreta de todo el contenido.

💳 **Precios en soles (Perú) y dólares ($ USD).**  
⚠️ *Prohibida la distribución o uso indebido del contenido.*  
    `.trim();

    await conn.sendMessage(m.chat, { text: message });
};

handler.help = ['precios'];
handler.tags = ['info'];
handler.command = ['precios'];
handler.register = true;

export default handler;
