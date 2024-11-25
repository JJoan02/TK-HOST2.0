export function isOwner(userJid) {
    const ownerNumber = "51910234457@s.whatsapp.net"; // Reemplaza con el número del owner
    return userJid === ownerNumber;
}
