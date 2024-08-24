import { execSync } from 'child_process';

// Ruta donde has clonado tu repositorio
const gitRepoPath = 'https://github.com/JJoan02/PruebasTK.git';

const handler = async (m, { conn, text }) => {
  try {
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''), { cwd: gitRepoPath });
    let messager = stdout.toString();
    if (messager.includes('Already up to date.')) {
      messager = `${lenguajeGB.smsAvisoIIG()} 𝙔𝘼 𝙀𝙎𝙏𝘼 𝘼𝘾𝙏𝙐𝘼𝙇𝙄𝙕𝘼𝘿𝙊 𝘼 𝙇𝘼 𝙑𝙀𝙍𝙎𝙄Ó𝙉 𝙍𝙀𝘾𝙄𝙀𝙉𝙏𝙀.`;
    }
    if (messager.includes('Updating')) {
      messager = `${lenguajeGB.smsAvisoEG()}` + stdout.toString();
    }
    conn.reply(m.chat, messager, m);
  } catch (error) {
    console.error('Error al ejecutar git pull:', error.message);

    try {
      const status = execSync('git status --porcelain', { cwd: gitRepoPath });
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('GataBotSession/') || line.includes('npm-debug.log')) {
              return null;
            }
            return '*→ ' + line.slice(3) + '*';
          })
          .filter(Boolean);
        if (conflictedFiles.length > 0) {
          const errorMessage = `${lenguajeGB.smsAvisoFG()} > *Se han encontrado cambios locales en los archivos del bot que entran en conflicto con las nuevas actualizaciones del repositorio. Para actualizar, reinstalar el bot o realizar las actualizaciones manualmente.*\n\n*\`ARCHIVO EN CONFLICTO :\`*\n\n${conflictedFiles.join('\n')}.*`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (statusError) {
      console.error('Error al ejecutar git status:', statusError.message);
      await m.reply(`\nError al verificar el estado del repositorio: ${statusError.message}`);
    }
  }
};

handler.command = /^(update|actualizar|gitpull)$/i;
handler.rowner = true;
export default handler;
