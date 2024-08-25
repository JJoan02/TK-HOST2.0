import fs from 'fs';
import path from 'path';

// Variables globales y configuración
const usersFilePath = path.join(__dirname, 'db', 'users.json');
let usersCache = {};
const wm = 'Admin-TK'; // Nombre de tu bot
const pp = 'https://telegra.ph/file/2b988b0eb3cf09b457129.jpg'; // URL de la imagen para la verificación

// Cargar los datos de usuarios desde el archivo JSON
const loadUsers = () => {
    try {
        if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath);
            usersCache = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error cargando los datos de usuarios:', error);
    }
};

// Guardar los datos de usuarios en el archivo JSON
const saveUsers = () => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(usersCache, null, 2));
    } catch (error) {
        console.error('Error guardando los datos de usuarios:', error);
    }
};

// Validar edad del usuario
const validateAge = (age) => {
    if (isNaN(age) || age < 1 || age > 120) {
        return 18; // Asigna 18 años si la edad es inválida
    }
    return age;
};

// Crear mensaje de verificación
const createVerificationMessage = (user, wm, sn) => {
    return `
😼 *REGISTRADO POR*
❱❱ ${wm}

📑 *TIPO DE REGISTRO* 
❱❱ ${user.registroC ? 'REGISTRO COMPLETO' : 'REGISTRO RÁPIDO'}

⌛ *FECHA/HORA*
❱❱ ${user.tiempo}

🛅 *CÓDIGO DE REGISTRO*
❱❱ ${sn}

✅ *INSIGNIA DE VERIFICACIÓN*
❱❱ ${user.registered ? 'ͧͧͧͦꙶͣͤ✓ᚲᴳᴮ' : ''}

✨ *NOMBRE* 
❱❱ ${user.name}

👀 *DESCRIPCIÓN*
❱❱ ${user.descripcion}

🔢 *EDAD* 
❱❱ ${user.age}`.trim();
};

// Verificar si el usuario ya está registrado
const isRegistered = (userId) => {
    return usersCache[userId] !== undefined;
};

// Guardar o actualizar los datos del usuario
const saveUser = (userId, userData) => {
    usersCache[userId] = userData;
    saveUsers();
};

// Manejar el comando de registro
handler = async (m, { conn, command }) => {
    const sn = Math.floor(Math.random() * 9999999).toString(); // Genera un código de registro aleatorio
    const userId = m.key.remoteJid;
    const fkontak = userId;

    let [_, nombre, edad] = m.text.split(' ');

    // Cargar datos de usuarios si no están en caché
    if (!Object.keys(usersCache).length) {
        loadUsers();
    }

    if (command === 'reg' || command === 'reg1') {
        // Si el usuario ya está registrado, actualizar su información
        if (isRegistered(userId)) {
            const existingUser = usersCache[userId];
            existingUser.name = nombre || existingUser.name;
            existingUser.age = validateAge(edad || existingUser.age);
            existingUser.tiempo = new Date().toLocaleString(); // Actualiza la fecha/hora
            saveUser(userId, existingUser);
            await conn.sendMessage(m.chat, { text: 'Tu información ha sido actualizada.' }, { quoted: fkontak });
            return;
        }

        // Crear nuevo usuario si no está registrado
        const user = {
            name: nombre || m.pushName || 'Usuario',
            descripcion: 'Descripción predeterminada',
            age: validateAge(edad || 18),
            tiempo: new Date().toLocaleString(),
            registroC: false,
            registered: true
        };

        saveUser(userId, user);

        const mensaje = createVerificationMessage(user, wm, sn);

        await conn.sendMessage(m.chat, { text: mensaje }, {
            quoted: fkontak,
            contextInfo: {
                externalAdReply: {
                    title: wm,
                    body: user.name,
                    thumbnailUrl: pp,
                    sourceUrl: 'https://www.atom.bio/gatabot/',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        });

        console.log(`Nuevo registro: ${user.name}, Edad: ${user.age}, Código: ${sn}`);
    }
};

handler.command = [
    'verify', 'verificar', 'register', 'registrar', 'reg', 'reg1', 
    'nombre', 'name', 'nombre2', 'name2', 'edad', 'age', 'edad2', 'age2', 
    'genero', 'género', 'gender', 'identidad', 'identity', 
    'pasatiempo', 'hobby', 'finalizar', 'pas2', 'pas3', 'pas4', 'pas5'
];

export default handler;
