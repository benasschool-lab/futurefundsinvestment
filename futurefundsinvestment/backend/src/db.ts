import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'data', 'futurefunds.db');
let db: Database.Database;

export function initializeDatabase() {
  const dataDir = path.dirname(dbPath);
  const fs = require('fs');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      reference TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `).run();
}

export function getDb() {
  if (!db) {
    throw new Error('Database has not been initialized');
  }
  return db;
}
