// src/ia/MemoryService.js

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises'; // Para asegurar que el directorio exista
import logger from '../utils/logger.js'; // Usar el logger centralizado

class MemoryService {
  /** @type {import('sqlite').Database | null} */
  #db = null;
  #dbPath = '';

  constructor() {
    this.#dbPath = path.resolve(process.cwd(), 'src', 'ia', 'memory.sqlite');
  }

  /**
   * Inicializa la conexión a la base de datos de la IA y crea las tablas si no existen.
   * @returns {Promise<void>}
   */
  async init() {
    if (this.#db) {
      logger.warn('⚠️ La base de datos de la IA ya ha sido inicializada.');
      return;
    }

    // Asegurarse de que el directorio exista
    const dbDir = path.dirname(this.#dbPath);
    try {
      await fs.mkdir(dbDir, { recursive: true });
      logger.debug(`📁 Directorio de la DB de la IA verificado/creado: ${dbDir}`);
    } catch (error) {
      logger.fatal({ err: error }, `❌ Error al crear el directorio para la DB de la IA:  ${dbDir}`);
      process.exit(1);
    }

    logger.info(`💾 Conectando a la base de datos de la IA en '${this.#dbPath}'...`);
    try {
      this.#db = await open({
        filename: this.#dbPath,
        driver: sqlite3.Database,
      });
      logger.info('✅ Conexión a la DB de la IA establecida exitosamente.' );
      await this.#createTables(); // Llama a la función que crea/migra tablas
    } catch (error) {
      logger.fatal({ err: error }, '❌ Error al conectar o inicializar la DB de la IA.' );
      process.exit(1);
    }
  }

  /**
   * Crea las tablas necesarias en la base de datos de la IA si no existen.
   * ✅  MODIFICADO: Ahora incluye la lógica de migración para user_profiles.
   * @private
   * @returns {Promise<void>}
   */
  async #createTables() {
    logger.info('📊 Verificando y creando/migrando tablas en la DB de la IA...');
    try {
      // Tabla para el historial de interacciones (conversaciones)
      await this.#db.exec(`
        CREATE TABLE IF NOT EXISTS interactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_jid TEXT NOT NULL,
          user_name TEXT,
          chat_id TEXT NOT NULL,
          chat_name TEXT,
          message_id TEXT,
          message_text TEXT,
          is_from_bot BOOLEAN NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          context_json TEXT -- Para almacenar contexto adicional de la conversación
        );
      `);

      // Tabla para la base de conocimiento (hechos aprendidos)
      await this.#db.exec(`
        CREATE TABLE IF NOT EXISTS knowledge_facts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fact_text TEXT NOT NULL UNIQUE, -- El hecho en sí, único
          added_by_jid TEXT,
          added_by_name TEXT,
          source_chat_id TEXT,
          source_message_id TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tabla para la personalidad adaptada por chat
      await this.#db.exec(`
        CREATE TABLE IF NOT EXISTS chat_personalities (
          chat_id TEXT PRIMARY KEY,
          personality_traits_json TEXT, -- JSON con rasgos de personalidad (ej. { "humor": "chistoso", "formalidad": "informal" }),
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // ✅ MIGRACIÓN: Crear la tabla user_profiles si no existe
      await this.#db.exec(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_jid TEXT PRIMARY KEY,
          profile_data_json TEXT, -- JSON con datos aprendidos sobre el usuario (ej. { "gustos": ["videojuegos"], "preferencias": {"color": "azul"} })
          interaction_score INTEGER DEFAULT 0, -- ✅  NUEVO: Campo para el score de interacción
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logger.info('✅ Tablas de la DB de la IA verificadas/creadas/migradas exitosamente.' );
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al crear/migrar tablas en la DB de la IA.' );
      throw error;
    }
  }

  /**
   * Añade una interacción (mensaje) al historial de la IA.
   * @param {object} interactionData - Datos de la interacción.
   * @param {string} interactionData.user_jid - JID del usuario.
   * @param {string} [interactionData.user_name] - Nombre del usuario.
   * @param {string} interactionData.chat_id - JID del chat.
   * @param {string} [interactionData.chat_name] - Nombre del chat.
   * @param {string} [interactionData.message_id] - ID del mensaje.
   * @param {string} [interactionData.message_text] - Contenido del mensaje.
   * @param {boolean} interactionData.is_from_bot - Si el mensaje es del bot.
   * @param {object} [interactionData.context_json] - Contexto adicional en formato JSON.
   * @returns {Promise<void>}
   */
  async addInteraction({ user_jid, user_name, chat_id, chat_name, message_id, message_text, is_from_bot, context_json = {} }) {
    try {
      await this.#db.run(
        `INSERT INTO interactions (user_jid, user_name, chat_id, chat_name, message_id, message_text, is_from_bot, context_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        user_jid,
        user_name,
        chat_id,
        chat_name,
        message_id,
        message_text,
        is_from_bot,
        JSON.stringify(context_json)
      );
      logger.debug(`💬 IA: Interacción registrada en ${chat_id} de ${user_name || user_jid}.`);
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al añadir interacción.' );
    }
  }

  /**
   * Obtiene las últimas interacciones de un chat específico.
   * @param {string} chat_id - JID del chat.
   * @param {number} limit - Número máximo de interacciones a recuperar.
   * @returns {Promise<Array<object>>}
   */
  async getRecentInteractions(chat_id, limit = 10) {
    try {
      const rows = await this.#db.all(
        `SELECT * FROM interactions WHERE chat_id = ? ORDER BY timestamp DESC LIMIT ?`,
        chat_id,
        limit
      );
      return rows.map(row => ({
        ...row,
        context_json: JSON.parse(row.context_json)
      }));
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al obtener interacciones recientes.' );
      return [];
    }
  }

  /**
   * Añade un hecho a la base de conocimiento de la IA.
   * @param {object} factData - Datos del hecho.
   * @param {string} factData.fact_text - El texto del hecho.
   * @param {string} [factData.added_by_jid] - JID de quien añadió el hecho.
   * @param {string} [factData.added_by_name] - Nombre de quien añadió el hecho.
   * @param {string} [factData.source_chat_id] - JID del chat de origen.
   * @param {string} [factData.source_message_id] - ID del mensaje de origen.
   * @returns {Promise<void>}
   */
  async addFact({ fact_text, added_by_jid, added_by_name, source_chat_id, source_message_id }) {
    try {
      await this.#db.run(
        `INSERT OR IGNORE INTO knowledge_facts (fact_text, added_by_jid, added_by_name, source_chat_id, source_message_id)
         VALUES (?, ?, ?, ?, ?)`,
        fact_text,
        added_by_jid,
        added_by_name,
        source_chat_id,
        source_message_id
      );
      logger.info(`🧠 IA: Hecho añadido a la base de conocimiento: "${fact_text.substring(0, 30)}..."`);
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al añadir hecho a la base de conocimiento.' );
    }
  }

  /**
   * Busca hechos relevantes en la base de conocimiento por palabra clave.
   * @param {string} keyword - Palabra clave para buscar.
   * @param {number} limit - Número máximo de hechos a recuperar.
   * @returns {Promise<Array<object>>}
   */
  async findRelevantFacts(keyword, limit = 5) {
    try {
      const rows = await this.#db.all(
        `SELECT fact_text FROM knowledge_facts WHERE fact_text LIKE ? LIMIT ?`,
        `%${keyword}%`,
        limit
      );
      return rows;
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al buscar hechos relevantes.' );
      return [];
    }
  }

  /**
   * Obtiene todos los hechos de la base de conocimiento.
   * @returns {Promise<Array<object>>}
   */
  async getAllFacts() {
    try {
      return await this.#db.all(`SELECT fact_text FROM knowledge_facts`);
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al obtener todos los hechos.' );
      return [];
    }
  }

  /**
   * Guarda o actualiza los rasgos de personalidad para un chat específico.
   * @param {string} chat_id - JID del chat.
   * @param {object} personality_traits - Objeto JSON con los rasgos de personalidad.
   * @returns {Promise<void>}
   */
  async setChatPersonality(chat_id, personality_traits) {
    try {
      await this.#db.run(
        `INSERT OR REPLACE INTO chat_personalities (chat_id, personality_traits_json, last_updated)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        chat_id,
        JSON.stringify(personality_traits)
      );
      logger.debug(`🎭 IA: Personalidad actualizada para el chat ${chat_id}.`);
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al establecer la personalidad del chat.' );
    }
  }

  /**
   * Obtiene los rasgos de personalidad para un chat específico.
   * @param {string} chat_id - JID del chat.
   * @returns {Promise<object | null>} Objeto con los rasgos de personalidad o null si no se encuentra.
   */
  async getChatPersonality(chat_id) {
    try {
      const row = await this.#db.get(
        `SELECT personality_traits_json FROM chat_personalities WHERE chat_id = ?`,
        chat_id
      );
      return row ? JSON.parse(row.personality_traits_json) : null;
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al obtener la personalidad del chat.' );
      return null;
    }
  }

  /**
   * ✅  NUEVO: Guarda o actualiza el perfil de un usuario.
   * @param {string} user_jid - JID del usuario.
   * @param {object} profile_data - Datos del perfil en formato JSON.
   * @returns {Promise<void>}
   */
  async saveUserProfile(user_jid, profile_data) {
    try {
      await this.#db.run(
        `INSERT OR REPLACE INTO user_profiles (user_jid, profile_data_json, last_updated)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        user_jid,
        JSON.stringify(profile_data)
      );
      logger.debug(`👤 IA: Perfil de usuario ${user_jid} guardado/actualizado.`);
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al guardar el perfil de usuario.' );
    }
  }

  /**
   * ✅  NUEVO: Obtiene el perfil de un usuario.
   * @param {string} user_jid - JID del usuario.
   * @returns {Promise<object | null>} Datos del perfil o null si no se encuentra.
   */
  async getUserProfile(user_jid) {
    try {
      const row = await this.#db.get(
        `SELECT profile_data_json, interaction_score FROM user_profiles WHERE user_jid = ?`,
        user_jid
      );
      if (row) {
        return {
          profile_data: JSON.parse(row.profile_data_json),
          interaction_score: row.interaction_score,
        };
      }
      return null;
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al obtener el perfil de usuario.' );
      return null;
    }
  }

  /**
   * ✅  NUEVO: Actualiza el score de interacción de un usuario.
   * @param {string} user_jid - JID del usuario.
   * @param {number} delta - Cantidad a sumar o restar al score (ej. 1 para positivo, -1 para negativo).
   * @returns {Promise<void>}
   */
  async updateInteractionScore(user_jid, delta) {
    try {
      // Obtener el score actual
      const currentProfile = await this.getUser Profile(user_jid);
      const currentScore = currentProfile ? currentProfile.interaction_score : 0;
      const newScore = Math.max(0, currentScore + delta); // Asegurar que el score no sea negativo

      await this.#db.run(
        `INSERT OR REPLACE INTO user_profiles (user_jid, profile_data_json, interaction_score, last_updated)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        user_jid,
        JSON.stringify(currentProfile ? currentProfile.profile_data : {}), // Mantener los datos de perfil existentes
        newScore
      );
      logger.debug(`📈 IA: Score de interacción para ${user_jid} actualizado a ${newScore}.`);
    } catch (error) {
      logger.error({ err: error }, '❌ IA: Error al actualizar el score de interacción.' );
    }
  }

  /**
   * Cierra la conexión a la base de datos de la IA.
   * @returns {Promise<void>}
   */
  async close() {
    if (this.#db) {
      await this.#db.close();
      this.#db = null;
      logger.info('💾 IA: Conexión a la base de datos cerrada.');
    }
  }
}

export default MemoryService;
