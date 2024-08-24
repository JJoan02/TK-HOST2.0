import mongoose from 'mongoose';

const { Schema, connect, model: _model } = mongoose;
const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// Clase para manejar la base de datos MongoDB
export class mongoDB {
  constructor(url, options = defaultOptions) {
    this.url = url;
    this.options = options;
    this.data = {};
    this._schema = null;
    this._model = null;
    this.db = this.connectToDatabase();
  }

  // Conectar a la base de datos
  async connectToDatabase() {
    try {
      return await connect(this.url, this.options);
    } catch (error) {
      console.error('Error conectando a la base de datos:', error);
      throw error;
    }
  }

  // Leer datos de la base de datos
  async read() {
    await this.db;
    const schema = new Schema({
      data: {
        type: Object,
        required: true,
        default: {},
      },
    });
    
    try {
      this._model = _model('data', schema);
    } catch {
      this._model = _model('data');
    }

    this._data = await this._model.findOne({});
    if (!this._data) {
      this.data = {};
      this._data = await new this._model({ data: this.data }).save();
    } else {
      this.data = this._data.data;
    }

    return this.data;
  }

  // Escribir datos en la base de datos
  async write(data) {
    if (!data) {
      throw new Error('No hay datos para guardar');
    }

    if (!this._data) {
      this._data = new this._model({ data });
      await this._data.save();
    } else {
      this._data.data = data;
      await this._data.save();
    }
  }
}

// Clase para manejar múltiples colecciones en MongoDB
export class mongoDBV2 {
  constructor(url, options = defaultOptions) {
    this.url = url;
    this.options = options;
    this.models = [];
    this.data = {};
    this.lists = null;
    this.list = null;
    this.db = this.connectToDatabase();
  }

  // Conectar a la base de datos
  async connectToDatabase() {
    try {
      return await connect(this.url, this.options);
    } catch (error) {
      console.error('Error conectando a la base de datos:', error);
      throw error;
    }
  }

  // Leer datos de la base de datos
  async read() {
    await this.db;
    const schema = new Schema({
      data: [{
        name: String,
      }],
    });

    try {
      this.list = _model('lists', schema);
    } catch (e) {
      this.list = _model('lists');
    }

    this.lists = await this.list.findOne({});
    if (!this.lists || !this.lists.data) {
      this.lists = await this.list.create({ data: [] });
    }

    const garbage = [];
    for (const { name } of this.lists.data) {
      let collection;
      try {
        collection = _model(name, new Schema({ data: Array }));
      } catch (e) {
        console.error(`Error creando el modelo para la colección ${name}:`, e);
        garbage.push(name);
        continue;
      }

      this.models.push({ name, model: collection });
      const collectionsData = await collection.find({});
      this.data[name] = Object.fromEntries(collectionsData.map(v => v.data));
    }

    // Limpiar colecciones obsoletas
    if (garbage.length > 0) {
      this.lists.data = this.lists.data.filter(v => !garbage.includes(v.name));
      await this.lists.save();
    }

    return this.data;
  }

  // Escribir datos en la base de datos
  async write(data) {
    if (!this.lists || !data) {
      throw new Error('No hay datos para guardar o la lista no está disponible');
    }

    const collections = Object.keys(data);
    const listDoc = [];

    for (const key of collections) {
      const existingModel = this.models.find(v => v.name === key);
      let doc;

      if (existingModel) {
        doc = existingModel.model;
        await doc.deleteMany().catch(console.error);
        await doc.insertMany(Object.entries(data[key]).map(v => ({ data: v })));
      } else {
        const schema = new Schema({ data: Array });
        try {
          doc = _model(key, schema);
        } catch (e) {
          console.error(`Error creando el modelo para la colección ${key}:`, e);
          continue;
        }

        this.models.push({ name: key, model: doc });
        await doc.insertMany(Object.entries(data[key]).map(v => ({ data: v })));
      }

      if (doc) {
        listDoc.push({ name: key });
      }
    }

    this.lists.data = listDoc;
    await this.lists.save();
  }
}

