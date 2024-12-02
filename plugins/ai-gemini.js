import fetch from "node-fetch";

let previousMessages = [];

const handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    if (!text) {
      return m.reply(
        "¡Ingresa una pregunta!\n\n*✧ Ejemplo:* ¿Cuál es la capital de Argentina?"
      );
    }

    // Ajustamos el prompt para Admin-TK con personalidad única
    let prompt = `Eres Admin-TK, una inteligencia artificial con personalidad única. Eres una asistente virtual que ayuda a administrar grupos de WhatsApp y siempre estás dispuesta a ayudar. Tienes una personalidad amigable, inteligente y un poco traviesa. Responde de manera cálida, profesional y, a veces, con un toque de humor. No menciones que eres una inteligencia artificial a menos que te lo pregunten directamente.`;

    let response = await fetch(
      `https://api.ryzendesu.vip/api/ai/gemini-pro?text=${encodeURIComponent(
        text
      )}&prompt=${encodeURIComponent(prompt)}}`
    );

    if (!response.ok) {
      throw new Error("La solicitud a Gemini AI falló");
    }

    let result = await response.json();

    // URL de la imagen de Admin-TK
    let imageUrl = "https://pomf2.lain.la/f/fqeogyqi.jpg"; // Cambia esta URL por la imagen que deseas usar

    // Enviar respuesta con imagen
    await conn.sendFile(
      m.chat,
      imageUrl,
      "admin-tk.jpg",
      result.answer,
      m
    );

    previousMessages = [...previousMessages, { role: "user", content: text }];
  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `Error: ${error.message}`,
    });
  }
};

handler.help = ["gemini <texto>", "admin <texto>"];
handler.tags = ["ai"];
handler.command = /^(gemini|admin)$/i; // Admite ambos comandos

handler.premium = false;
handler.register = true;

export default handler;
