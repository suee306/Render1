// ===== 初始化 =====
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const notesDiv = document.getElementById("notes");

// ===== 自动加载 =====
window.onload = () => {
  editor.value = localStorage.getItem("draft") || "";
  renderPreview();
  loadNotes();
};

// ===== 实时预览 =====
editor.addEventListener("input", () => {
  localStorage.setItem("draft", editor.value);
  renderPreview();
});

function renderPreview() {
  preview.innerHTML = marked.parse(editor.value);
}

// ===== 保存笔记 =====
function saveNote() {
  const content = editor.value;
  const tags = document.getElementById("tags").value;

  let notes = JSON.parse(localStorage.getItem("notes") || "[]");

  notes.unshift({
    content,
    tags,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("notes", JSON.stringify(notes));

  loadNotes();
  editor.value = "";
}

// ===== 渲染卡片 =====
function loadNotes() {
  let notes = JSON.parse(localStorage.getItem("notes") || "[]");

  notesDiv.innerHTML = "";

  notes.forEach((n, i) => {
    notesDiv.innerHTML += `
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow hover:scale-105 transition">
        <div class="text-xs opacity-60 mb-2">${n.time}</div>
        <div class="text-sm mb-2">${marked.parse(n.content)}</div>
        <div class="text-xs text-blue-500">${n.tags}</div>
      </div>
    `;
  });
}

// ===== 暗黑模式 =====
function toggleDark() {
  document.documentElement.classList.toggle("dark");
}
