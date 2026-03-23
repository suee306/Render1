const path = require("path");
const crypto = require("crypto");
const express = require("express");
const {
  initDb,
  listNotes,
  createNote,
  removeNoteById,
  clearNotes,
  DB_PATH,
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

const staticRoot = path.join(__dirname, "public");
app.use(express.static(staticRoot));

app.get("/api/notes", async (req, res) => {
  try {
    const notes = await listNotes();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Failed to load notes" });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const content = String(req.body?.content || "").trim();
    const tags = String(req.body?.tags || "").trim();

    if (!content) {
      res.status(400).json({ message: "content is required" });
      return;
    }

    const id =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const created = await createNote({ id, content, tags });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: "Failed to create note" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const noteId = String(req.params.id || "").trim();
    if (!noteId) {
      res.status(400).json({ message: "id is required" });
      return;
    }

    const deletedCount = await removeNoteById(noteId);
    if (deletedCount === 0) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete note" });
  }
});

app.delete("/api/notes", async (req, res) => {
  try {
    await clearNotes();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to clear notes" });
  }
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(staticRoot, "index.html"));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`SQLite DB path: ${DB_PATH}`);
      console.log(`Static root: ${staticRoot}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
