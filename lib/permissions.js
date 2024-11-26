export function isOwner(userJid) {
    const ownerNumbers = [
        "51910234457@s.whatsapp.net", // Primer owner
        "50557865603@s.whatsapp.net", // Segundo owner
        // Aquí puedes agregar más números en el futuro
    ];
    return ownerNumbers.includes(userJid);
}
