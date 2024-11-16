import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, args, command, text }) => {
  if (!text) throw m.reply(`Y el link?\n✦ Ejemplo: *.xnxxvideo https://www.xnxx.com/video-141ewlbb/free_use_anytime_sex_big_ass_latina_milf_step_mom_after_deal_with_step_son*`)
  m.reply('✦ Espere un momento...')
  
  try {
    let res = await fetch(`https://api.agatz.xyz/api/xnxxdown?url=${encodeURIComponent(text)}`)
    let json = await res.json()
    
    if (json.status !== 200 || !json.data.status) throw m.reply('Error API')

    let videoUrl = json.data.files.high || json.data.files.low || json.data.files.HLS
    let caption = `Titulo: ${json.data.title}\nDuracion: ${json.data.duration}\nInfo: ${json.data.info}`
    let thumbnailUrl = json.data.image

    await conn.sendMessage(m.chat, { 
      video: { url: videoUrl }, 
      caption: caption 
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      image: { url: thumbnailUrl },
      caption: `Thumbnail`
    }, { quoted: m })
    
  } catch (e) {
    m.reply(`Se produjo un error, no se pueden recuperar datos de la URL/enlace que ingresó`)
  }
}

handler.help = ['xnxxvideo *<link>*']
handler.tags = ['downloader', 'nsfw']
handler.command = /^xnxxvideo|xnxxdl$/i
handler.limit = false
handler.premium = true

export default handler