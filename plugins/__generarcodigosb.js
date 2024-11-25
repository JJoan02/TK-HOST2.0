// plugins/generarcodigosb.js
let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) throw 'Solo el owner puede usar este comando.';
  
  let user = m.mentionedJid[0];
  if (!user) throw 'Debes mencionar a un usuario.';

  let codigo = generarCodigoInicial();
  let data = JSON.parse(fs.readFileSync('./codigos.json'));
  data.codigos.push({
    codigo,
    usuario: user,
    expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira en 24 horas
  });
  fs.writeFileSync('./codigos.json', JSON.stringify(data, null, 2));

  conn.sendMessage(user, { text: `Tu código es: ${codigo}` });
  m.reply('Código generado y enviado al usuario.');
};

function generarCodigoInicial() {
  return `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

handler.command = /^generarcodigosb$/i;
export default handler;

