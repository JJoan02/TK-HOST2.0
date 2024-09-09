import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

// Función para eliminar archivos, con exclusión de 'creds.json'
const deleteFiles = async (sessionPath) => {
  const files = await fs.readdir(sessionPath);
  let filesDeleted = 0;
  for (const file of files) {
    if (file !== 'creds.json') {
      await fs.unlink(path.join(sessionPath, file));
      filesDeleted++;
    }
  }
  return filesDeleted;
};

const handler = async (m, { conn, usedPrefix }) => {
  // Verificación para asegurarse de que el comando se ejecute solo en el bot principal
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(
      m.chat,
      { text: `🛑 *¡Oye, este comando es solo para el número principal del bot! Deja de hacer travesuras.* 😏` },
      { quoted: m }
    );
  }

  const sessionPath = './AdminSession/';

  // Verifica si la carpeta de sesiones existe
  if (!existsSync(sessionPath)) {
    return conn.sendMessage(
      m.chat,
      { text: `📂 *Oops... la carpeta "AdminSession" no existe o está más vacía que mi paciencia.* 😬` },
      { quoted: m }
    );
  }

  try {
    const filesDeleted = await deleteFiles(sessionPath);

    // Retroalimentación al usuario sobre el proceso de eliminación
    const messageText = filesDeleted === 0
      ? `🤷‍♂️ *No encontré nada para borrar en la carpeta "AdminSession". ¿Qué esperabas?* 🙄`
      : `🗑️ *¡Misión cumplida!* Eliminé *${filesDeleted}* archivo(s), dejando intacto el preciado *(creds.json)*. 😎`;

    await conn.sendMessage(m.chat, { text: messageText }, { quoted: m });
  } catch (err) {
    console.error('Error al eliminar archivos de sesión:', err);
    await conn.sendMessage(
      m.chat,
      { text: `❌ *Algo salió mal al intentar eliminar los archivos de sesión. 😕*` },
      { quoted: m }
    );
  }

  // Mensaje final indicando que el proceso se completó
  await conn.sendMessage(
    m.chat,
    {
      text: `✅ *¡Listo! El bot está funcionando otra vez.*\n\nSi el bot no te responde, tal vez esté tomándose una siesta. Hazle un poco de spam para despertarlo. 😏\n\n*Ejemplo de spam:*\n${usedPrefix}s\n${usedPrefix}s\n${usedPrefix}s`,
    },
    { quoted: m }
  );
};

handler.help = ['del_reg_in_session_owner'];
handler.tags = ['owner'];
handler.command = /^(del_reg_in_session_owner|clearallsession|deletegata)$/i;
handler.rowner = true;

export default handler;
