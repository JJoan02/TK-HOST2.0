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
      { text: `${lenguajeGB['smsAvisoAG']()}⚠️ *Este comando solo puede ser usado en el número principal del bot.*` },
      { quoted: m }
    );
  }

  const sessionPath = './AdminSession/';

  // Verifica si la carpeta de sesiones existe
  if (!existsSync(sessionPath)) {
    return conn.sendMessage(
      m.chat,
      { text: `${lenguajeGB['smsAvisoFG']()} 📁 *La carpeta (AdminSession) no existe o está vacía.*` },
      { quoted: m }
    );
  }

  try {
    const filesDeleted = await deleteFiles(sessionPath);

    // Retroalimentación al usuario sobre el proceso de eliminación
    const messageText = filesDeleted === 0
      ? `ℹ️ No se encontraron archivos para eliminar en la carpeta *(AdminSession)*.`
      : `🗑️ Proceso de eliminación completado: *${filesDeleted}* archivo(s) eliminado(s), excepto *(creds.json)*.`;

    await conn.sendMessage(m.chat, { text: messageText }, { quoted: m });
  } catch (err) {
    console.error('Error al eliminar archivos de sesión:', err);
    await conn.sendMessage(
      m.chat,
      { text: `❌ *Ocurrió un error al eliminar los archivos de sesión.*` },
      { quoted: m }
    );
  }

  // Mensaje final indicando que el proceso se completó
  await conn.sendMessage(
    m.chat,
    {
      text: `${lenguajeGB['smsAvisoRG']()}✅ *El bot ya está funcional.*\n\nSi el bot no responde a tus comandos, intenta hacer un pequeño spam para reactivarlo.\n\n*Ejemplo de spam:*\n${usedPrefix}s\n${usedPrefix}s\n${usedPrefix}s`,
    },
    { quoted: m }
  );
};

handler.help = ['del_reg_in_session_owner'];
handler.tags = ['owner'];
handler.command = /^(del_reg_in_session_owner|clearallsession|deletegata)$/i;
handler.rowner = true;

export default handler;
