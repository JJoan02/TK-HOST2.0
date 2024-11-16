import fetch from 'node-fetch'
const { 
  proto, 
  generateWAMessageFromContent, 
  prepareWAMessageMedia 
} = (await import('@adiwajshing/baileys')).default

var handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw m.reply('✦ Ingresa el nombre de usuario de Github.')

  const username = text.trim();

  try {
    let githubData = await getGithubData(username);
    if (!githubData) {
      return conn.sendMessage(m.chat, { text: 'Usuario no encontrado.' }, { quoted: m });
    }

    let messageText = `
*GitHub Stalker:*
- *Nombre de usuario*: ${githubData.login}
- *Nombre*: ${githubData.name || 'No disponible'}
- *Bio*: ${githubData.bio || 'No disponible'}
- *Localidad*: ${githubData.location || 'No disponible'}
- *Repositorios*: ${githubData.public_repos}
- *Seguidores*: ${githubData.followers}
- *Siguiendo*: ${githubData.following}
- *Link Perfil*: https://github.com/${githubData.login}
    `;

    const profileImageUrl = githubData.avatar_url;

    if (command === 'githubstalkb') {
      let msgs = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            "messageContextInfo": {
              "deviceListMetadata": {},
              "deviceListMetadataVersion": 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: messageText
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: wm
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false,
                ...await prepareWAMessageMedia({ image: { url: profileImageUrl } }, { upload: conn.waUploadToServer })
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    "name": "cta_url",
                    "buttonParamsJson": `{
                      "display_text":"Visit ${githubData.login}'s GitHub Profile",
                      "url":"https://github.com/${githubData.login}"
                    }`
                  }
                ],
              })
            })
          }
        }
      }, { quoted: m });

      return await conn.relayMessage(m.chat, msgs.message, {});

    } else {
      const profileMessage = `
*GitHub Stalker:*
- *Nombre de usuario*: ${githubData.login}
- *Nombre*: ${githubData.name || 'No disponible'}
- *Bio*: ${githubData.bio || 'No disponible'}
- *Localidad*: ${githubData.location || 'No disponible'}
- *Repositorios*: ${githubData.public_repos}
- *Seguidores*: ${githubData.followers}
- *Siguiendo*: ${githubData.following}
- *Link Perfil*: https://github.com/${githubData.login}
      `;
      
      await conn.sendMessage(m.chat, { image: { url: profileImageUrl }, caption: profileMessage }, { quoted: m });
    }

  } catch (e) {
    console.error(e);
    conn.sendFile(m.chat, 'error.mp3', 'error.mp3', null, m, true, { type: "audioMessage", ptt: true });
  }
}

async function getGithubData(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.message === 'Not Found') return null;
    return data;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return null;
  }
}
handler.help = ['githubstalkb', 'githubstalk']
handler.tags = ['info']
handler.command = /^(githubstalkb|githubstalk)$/i
handler.register = true
export default handler;