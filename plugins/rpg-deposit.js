let handler = async (m, { args }) => {
   let user = global.db.data.users[m.sender]
   if (!args[0]) return m.reply('✧ Por favor, ingresa la cantidad de *coins* que deseas depositar. 💰')
   if (args[0].toLowerCase() === 'xd') return m.reply('✧ Por favor, ingresa una cantidad válida de *coins*, no "xD". 😂')
   if (isNaN(args[0]) && args[0].toLowerCase() !== 'all') return m.reply('✧ La cantidad debe ser un número válido o la palabra "all". 🔢')
   if (args[0] < 1 && args[0].toLowerCase() !== 'all') return m.reply('✧ Ingresa una cantidad válida de *coins*. ⚠️')

   let count
   if (args[0].toLowerCase() === 'all') {
      count = parseInt(user.limit)
      if (count === 0) return m.reply('✧ No tienes *coins* disponibles en la cartera para depositar. ❌')
   } else {
      count = parseInt(args[0])
      if (count > user.limit) return m.reply(`✧ No tienes suficientes *coins*. Solo tienes *${user.limit} coins* en la cartera. 💸`)
   }

   user.limit -= count
   user.bank += count

   await m.reply(`✧ Has depositado *${count} coins* al banco. 🏦 ¡Sigue ahorrando para alcanzar tus metas! 💪✨`)
}

handler.help = ['depositar']
handler.tags = ['rpg']
handler.command = ['deposit', 'depositar', 'dep', 'd']
handler.register = true
export default handler
