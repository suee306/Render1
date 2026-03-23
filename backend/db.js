const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, "notes.db");
const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function listNotes() {
  const rows = await all(
    `SELECT id, content, tags, created_at FROM notes ORDER BY datetime(created_at) DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    tags: row.tags || "",
    time: new Date(row.created_at).toLocaleString(),
  }));
}

async function createNote({ id, content, tags }) {
  await run(`INSERT INTO notes (id, content, tags) VALUES (?, ?, ?)`, [id, content, tags]);
  return {
    id,
    content,
    tags,
    time: new Date().toLocaleString(),
  };
}

async function removeNoteById(id) {
  const result = await run(`DELETE FROM notes WHERE id = ?`, [id]);
  return result.changes;
}

async function clearNotes() {
  await run(`DELETE FROM notes`);
}

module.exports = {
  initDb,
  listNotes,
  createNote,
  removeNoteById,
  clearNotes,
  DB_PATH,
};
