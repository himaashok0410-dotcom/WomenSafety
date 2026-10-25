const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this._init();
  }

  _init() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error(`Error reading ${this.name} data store:`, err.message);
      return [];
    }
  }

  _write(items) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error writing ${this.name} data store:`, err.message);
    }
  }

  async find(filter = {}) {
    const items = this._read();
    return items.filter(item => {
      for (const [key, value] of Object.entries(filter)) {
        if (item[key] !== value) return false;
      }
      return true;
    });
  }

  async findOne(filter = {}) {
    const items = this._read();
    return items.find(item => {
      for (const [key, value] of Object.entries(filter)) {
        if (item[key] !== value) return false;
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const items = this._read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const items = this._read();
    const now = new Date().toISOString();
    const record = {
      _id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    items.push(record);
    this._write(items);
    return record;
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const items = this._read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const updated = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this._write(items);
    return updated;
  }

  async findByIdAndDelete(id) {
    const items = this._read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const deleted = items.splice(index, 1)[0];
    this._write(items);
    return deleted;
  }

  async deleteMany(filter = {}) {
    const items = this._read();
    const remaining = items.filter(item => {
      for (const [key, value] of Object.entries(filter)) {
        if (item[key] === value) return false;
      }
      return true;
    });
    this._write(remaining);
    return { deletedCount: items.length - remaining.length };
  }
}

const db = {
  users: new Collection('users'),
  contacts: new Collection('contacts'),
  journeys: new Collection('journeys'),
  checkins: new Collection('checkins'),
  alerts: new Collection('alerts'),
  isFallback: true
};

module.exports = db;
