import axios from 'axios';
export default async function handler(m, { conn, command, text }) {
 if (!text) {
  await conn.sendMessage(m.chat, { text: 'Ingresa el nombre de un usuario de TikTok para obtener su perfil.' }, { quoted: m });
  return;
 }
 try {
  let api = `https://deliriusapi-official.vercel.app/tools/tiktokstalk?q=${encodeURIComponent(text)}`;
  let response = await axios.get(api);
  let data = response.data;
  let url = data.result.users.avatarLarger || undefined;
  if (data.status && url) {
   await conn.sendMessage(m.chat, { image: { url: url }, caption: text }, { quoted: m });
  }
 } catch (e) {
  console.error(e);
  m.reply(e.toString());
 }
}
handler.command = ['pptiktok', 'pptt'];
