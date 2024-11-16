import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw m.reply(`✧ Ingresa el Dominio/Sub Dominio!\n\n*✧ Ejemplo:* ryzendesu.com`);

  if (text.includes('https://') || text.includes('http://')) throw m.reply(`✧ Ingresa el Dominio/Sub Dominio!\n\n*✧ Ejemplo:* ryzendesu.com`);

  try {
    // fetch pertama
    let api_key = 'E4/gdcfciJHSQdy4+9+Ryw==JHciNFemGqOVIbyv';
    let res1 = await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${text}`, {
      headers: { 'X-Api-Key': api_key },
      contentType: 'application/json'
    })
    .then(response => response.text())
    .catch(error => {
      console.log(error);
      return fetch(`https://api.hackertarget.com/dnslookup/?q=${text}`)
      .then(response => response.text())
      .then(data => {
        m.reply(`*✧ Este es el resultado de la búsqueda de DNS para ${text}:*\n${data}`)
        console.log(data)
      })
      .catch(error => {
        console.error(error)
        m.reply('*✧ No se pueden procesar las solicitudes de búsqueda de DNS*')
      })
    })
    m.reply(`*✧ Este es el resultado de la búsqueda de DNS para ${text}:*\n${res1}`)
    console.log(res1)

  } catch (error) {
    console.log(error);
    m.reply('*Error!*')
  }
}

handler.help = ['lookup']
handler.tags = ['internet']
handler.command = /^(lookup)$/i

handler.register = true


export default handler
