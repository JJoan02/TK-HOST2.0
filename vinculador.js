// vinculador.js
import readline from 'readline'
import chalk from 'chalk'

function mostrarInicio() {
  console.clear()
  console.log(chalk.cyan(`
╔══════════════════════════════════════╗
║        🚀 Starting TK-HOST...        ║
╚══════════════════════════════════════╝
  `))
  console.log(chalk.green('✔ 📲 Ingresa el número de WhatsApp donde estará el Bot') + chalk.white(' (con código de país, sin "+")') + chalk.gray('\n   Ejemplo: ') + chalk.cyanBright('51903347138'))

}

function iniciarVinculacion(callback) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  rl.question(chalk.yellow('\n📲 Ingresa el número de WhatsApp donde estará el Bot (con código de país, sin "+"): '), (numero) => {
    console.log(chalk.blueBright(`\n✅ Número recibido: ${numero}`))

    console.log(chalk.magenta(`
╔══════════════════════════════════════╗
║     🔐 MENÚ DE VINCULACIÓN           ║
╠══════════════════════════════════════╣
║  1) 🔍 Vincular por código QR         ║
║  2) 🔢 Vincular por código de 8 dígitos║
╚══════════════════════════════════════╝
    `))

    rl.question(chalk.cyan('👉 Elige una opción (1 o 2): '), (opcion) => {
      rl.close()
      switch (opcion.trim()) {
        case '1':
          console.log(chalk.green('\n📡 Iniciando vinculación por código QR...'))
          callback('qr', numero)
          break
        case '2':
          console.log(chalk.green('\n🔐 Iniciando vinculación por código de 8 dígitos...'))
          callback('code', numero)
          break
        default:
          console.log(chalk.red('\n❌ Opción inválida. Reinicia el proceso.'))
          process.exit(1)
      }
    })
  })
}

export { mostrarInicio, iniciarVinculacion }
