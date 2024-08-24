import { resolve, dirname as _dirname } from 'path';
import _fs, { existsSync, readFileSync } from 'fs';
const { promises: fs } = _fs;

class Database {
  /**
   * Create new Database
   * @param {String} filepath Path to specified JSON database
   * @param  {...any} args JSON.stringify arguments
   */
  constructor(filepath, ...args) {
    this.file = resolve(filepath);
    this.logger = console;
    this._jsonargs = args;
    this._state = false;
    this._queue = [];
    
    // Adjust the interval frequency as needed
    this._interval = setInterval(() => this._processQueue(), 5000); // Default to 5 seconds

    this._load(); // Load data synchronously on initialization
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this.save(); // Queue save operation
  }

  /**
   * Queue Load
   */
  load() {
    this._queue.push('_load');
  }

  /**
   * Queue Save
   */
  save() {
    this._queue.push('_save');
  }

  /**
   * Process the queue
   */
  async _processQueue() {
    if (!this._state && this._queue.length > 0) {
      this._state = true;
      const task = this._queue.shift();
      try {
        await this[task](); // Call the corresponding method
      } catch (error) {
        this.logger.error(`Error processing ${task}:`, error);
      } finally {
        this._state = false;
      }
    }
  }

  /**
   * Load data from the file
   * @private
   */
  _load() {
    try {
      this._data = existsSync(this.file) ? JSON.parse(readFileSync(this.file)) : {};
    } catch (e) {
      this.logger.error('Error loading data:', e);
      this._data = {}; // Initialize as empty object on error
    }
  }

  /**
   * Save data to the file
   * @private
   */
  async _save() {
    try {
      const dirname = _dirname(this.file);
      if (!existsSync(dirname)) {
        await fs.mkdir(dirname, { recursive: true });
      }
      await fs.writeFile(this.file, JSON.stringify(this._data, ...this._jsonargs));
    } catch (e) {
      this.logger.error('Error saving data:', e);
    }
  }

  /**
   * Clean up resources
   */
  close() {
    clearInterval(this._interval);
  }
}

export default Database;
