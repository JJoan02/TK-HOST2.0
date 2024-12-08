let handler = async (m, { conn }) => {
    const message = `
🌟 *Bienvenidos a Lexa Bloom* 🌟

🔞 **Contenido Exclusivo y Personalizado** 🔞  
Explora nuestra variedad de servicios exclusivos y personalizados:

📸 **Fotos:**
- **Fotos en hilo:** $1 (4 soles).  
- **Fotos del pecho:** $3 (12 soles).  
- **Fotos de muslos:** $3 (12 soles).  
- **Fotos de piernas abiertas:** $5 (20 soles).  
- **Fotos completas con una pose:** $8 (32 soles).  
- **Fotos personalizadas con tu nombre:** $10 (40 soles).  

🎥 **Videos:**
- **Videos cortos (1 minuto):** $4 (16 soles).  
- **Videos largos (hasta 10 minutos):** $10 (40 soles).  
- **Videos personalizados (nombre y temática):** $15 (60 soles).  
- **Video bailando en lencería:** $7 (28 soles).  
- **Video modelando poses específicas:** $12 (48 soles).  
- **Video con enfoque en piernas o muslos:** $8 (32 soles).  
- **Video íntimo (con enfoque sugerido):** $20 (80 soles).  

💬 **Cómo funciona:**
1. Contáctanos para detallar tus solicitudes.
2. Realiza el pago vía Yape o tus métodos de pago preferidos 💜.
3. Recibe contenido exclusivo de alta calidad.

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
