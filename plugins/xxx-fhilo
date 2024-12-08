let handler = async (m, { conn }) => {
    const message = `
📸 **Fotos en Hilo** 📸  
_Explora nuestra sensual galería de fotos en hilo con detalles exclusivos para ti._

💰 **Precio:**  
- $1 (4 soles).

💳 **Formas de Pago:**  
Aceptamos pagos por **Yape** o **transferencia bancaria**.  
✅ _Envíanos tu captura de pago para confirmar tu pedido._

📞 **Contacto:**  
- Escríbenos para más detalles y envía tu captura:  
  > *+51 927 803 866*

🚀 **Entrega Rápida y Segura.**  
¡Atrévete a descubrir lo exclusivo!  
⚠️ _Contenido para mayores de edad. Respeta nuestras normas de uso._
    `.trim();

    await conn.sendMessage(m.chat, { text: message });
};

handler.help = ['fhilo'];
handler.tags = ['content'];
handler.command = ['fhilo'];
handler.register = true;

export default handler;
