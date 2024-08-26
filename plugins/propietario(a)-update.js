import { execSync } from 'child_process';

// Ruta del repositorio local que has clonado
const gitRepoPath = 'https://github.com/JJoan02/Admin-TK.git'; // Cambia esto si es necesario

const handler = async (m, { conn, text }) => {
  try {
    // Ejecuta el comando 'git pull'. Si el mensaje es del propietario del bot ('fromMe') y contiene texto adicional, lo añade al comando.
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''), { cwd: gitRepoPath });

    // Convierte la salida del comando a una cadena de texto
    let messager = stdout.toString();

    // Verifica si la salida indica que ya está actualizado
    if (messager.includes('Already up to date.')) {
      messager = `${lenguajeGB.smsAvisoIIG()} 𝙔𝘼 𝙀𝙎𝙏𝘼 𝘼𝘾𝙏𝙐𝘼𝙇𝙄𝙕𝘼𝘿𝙊 𝘼 𝙇𝘼 𝙑𝙀𝙍𝙎𝙄Ó𝙉 𝙍𝙀𝘾𝙄𝙀𝙉𝙏𝙀.`;
    }
    // Verifica si la salida indica que se ha actualizado
    if (messager.includes('Updating')) {
      messager = `${lenguajeGB.smsAvisoEG()}` + stdout.toString();
    }

    // Envía la respuesta al chat
    conn.reply(m.chat, messager, m);
  } catch (error) {
    console.error('Error al ejecutar git pull:', error.message);

    try {
      // Si hay un error, verifica el estado del repositorio local
      const status = execSync('git status --porcelain', { cwd: gitRepoPath });

      // Si hay cambios locales en el repositorio, procesa la salida para identificar archivos en conflicto
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')  // Divide la salida en líneas
          .filter(line => line.trim() !== '')  // Elimina líneas vacías
          .map(line => {
            // Excluye archivos y carpetas que no se deben considerar
            if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('AdminSession/') || line.includes('npm-debug.log')) {
              return null;
            }
            // Retorna el archivo en conflicto con formato adecuado
            return '*→ ' + line.slice(3) + '*';  // Slice para omitir el código de estado de git (' M', '??', etc.)
          })
          .filter(Boolean);  // Elimina elementos nulos

        // Si hay archivos en conflicto, envía un mensaje con detalles
        if (conflictedFiles.length > 0) {
          const errorMessage = `${lenguajeGB.smsAvisoFG()} > *Se han encontrado cambios locales en los archivos del bot que entran en conflicto con las nuevas actualizaciones del repositorio. Para actualizar, reinstala el bot o realiza las actualizaciones manualmente.*\n\n*\`ARCHIVO EN CONFLICTO :\`*\n\n${conflictedFiles.join('\n')}.*`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (statusError) {
      console.error('Error al ejecutar git status:', statusError.message);
      await m.reply(`\nError al verificar el estado del repositorio: ${statusError.message}`);
    }
  }
};

// Define los comandos que activan este handler
handler.command = /^(update|actualizar|gitpull)$/i;
handler.rowner = true;  // Solo el propietario del bot puede ejecutar este comando

export default handler;
