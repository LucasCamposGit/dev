// lib/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Cache the database connection promise
let dbPromise = null;

/**
 * Opens and returns a database connection.
 * Caches the connection promise to avoid reconnecting on every request in dev mode.
 * IMPORTANT: In production/serverless, managing file-based DB connections needs careful consideration.
 * The database file path might need adjustment based on deployment environment.
 */
export async function openDb() {
  if (!dbPromise) {
    // Construct the absolute path to the database file
    // Assumes notes.db is in the project root directory
    const dbPath = path.join(process.cwd(), 'notes.db');
    console.log(`Attempting to connect to database at: ${dbPath}`);

    dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database
    }).then(async (db) => {
      console.log('Connected to the SQLite database.');
      // Run migrations or initial setup if needed (optional)
      // await db.migrate({ force: 'last' });
      // Ensure foreign key support is enabled
      await db.run('PRAGMA foreign_keys = ON;');
      return db;
    }).catch(err => {
        console.error('Error opening database', err.message);
        // Reset promise if connection failed
        dbPromise = null;
        throw err; // Re-throw error to be caught by API routes
    });
  }
  return dbPromise;
}

/**
 * Optional: Function to initialize the database schema.
 * Can be called from a script (e.g., scripts/init-db.js).
 */
export async function initializeDb() {
    const db = await openDb();
    console.log('Initializing database schema...');
    await db.exec(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            parent_id INTEGER NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES notes (id) ON DELETE CASCADE
        );
    `);
    console.log('Database schema initialized.');
    // Don't close the connection here if openDb caches it
    // await db.close();
}

// Optional: Script to run initialization (e.g., scripts/init-db.js)
/*
// scripts/init-db.js
import { initializeDb } from '../lib/db.js';

initializeDb().catch(console.error);
*/
