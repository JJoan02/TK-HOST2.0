import {join} from 'path';
import {promises as fs} from 'fs';
import {promisify} from 'util';
import {google} from 'googleapis';
import {EventEmitter} from 'events';

// Si modificas estos alcances (scopes), debes eliminar el archivo token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// La ruta al archivo token.json que almacena los tokens de acceso y actualización.
const TOKEN_PATH = join(__dirname, '..', 'token.json');

class GoogleAuth extends EventEmitter {
  constructor() {
    super();
  }

  // Método para manejar la autenticación del usuario
  async authorize(credentials) {
    let token;
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    try {
      // Intenta leer el token desde el archivo
      token = JSON.parse(await fs.readFile(TOKEN_PATH));
    } catch (e) {
      // Si el token no existe, genera la URL de autenticación
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      this.emit('auth', authUrl);
      const code = await promisify(this.once).bind(this)('token');
      const res = await oAuth2Client.getToken(code);
      token = res.tokens;
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    } finally {
      oAuth2Client.setCredentials(token);
    }
    return oAuth2Client;
  }

  token(code) {
    this.emit('token', code);
  }
}

class GoogleDrive extends GoogleAuth {
  constructor() {
    super();
    this.drive = null;
  }

  // Método para inicializar el cliente de Google Drive
  async init(credentials) {
    const auth = await this.authorize(credentials);
    this.drive = google.drive({version: 'v3', auth});
  }

  // Obtener el ID de una carpeta a partir de su nombre o ruta
  async getFolderID(folderName) {
    const res = await this.drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    const folder = res.data.files[0];
    return folder ? folder.id : null;
  }

  // Obtener información sobre un archivo en Drive
  async infoFile(fileName) {
    const res = await this.drive.files.list({
      q: `name='${fileName}'`,
      fields: 'files(id, name, mimeType, size)',
      spaces: 'drive',
    });
    const file = res.data.files[0];
    return file ? file : null;
  }

  // Listar los archivos dentro de una carpeta
  async folderList(folderID) {
    const res = await this.drive.files.list({
      q: `'${folderID}' in parents`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    return res.data.files;
  }

  // Descargar un archivo desde Google Drive
  async downloadFile(fileID, destPath) {
    const dest = fs.createWriteStream(destPath);
    const res = await this.drive.files.get({fileId: fileID, alt: 'media'}, {responseType: 'stream'});
    await new Promise((resolve, reject) => {
      res.data
        .on('end', () => {
          console.log('Archivo descargado.');
          resolve();
        })
        .on('error', err => {
          console.error('Error al descargar el archivo.', err);
          reject(err);
        })
        .pipe(dest);
    });
  }

  // Subir un archivo a Google Drive
  async uploadFile(filePath, folderID) {
    const fileName = filePath.split('/').pop();
    const fileMetadata = {
      name: fileName,
      parents: folderID ? [folderID] : [],
    };
    const media = {
      body: fs.createReadStream(filePath),
    };
    const res = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    return res.data.id;
  }
}

export {
  GoogleAuth,
  GoogleDrive,
};
