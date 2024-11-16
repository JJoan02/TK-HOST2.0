let handler = async (m) => {
    let users = global.db.data.users;
    let chats = global.db.data.chats;
    let deletedUsers = 0;
  
    for (let user in users) {
      if (!users[user].registered && !users[user].banned) {
        delete users[user];
        deletedUsers++;
  
        // Menghapus entri dari chats jika kunci sama dengan nomor pengguna yang dihapus
        if (chats[user]) {
          delete chats[user];
        }
      }
    }
  
    global.db.data.users = users;
    global.db.data.chats = chats;
    await global.db.write();
  
    let totalreg = Object.keys(users).length;
    let rtotalreg = Object.values(users).filter(user => user.registered == true).length;
    let kon = `*Base de datos actual ${totalreg} usuarios*\n*Registro actual ${rtotalreg} usuarios*\n*${deletedUsers} usuarios ha sido eliminados porque no estan registrados*`;
    m.reply(kon);
  };

  handler.command = /^(delete-unreg)$/i
  handler.owner = true
  
  export default handler
  