/* ---------- Datos y persistencia ---------- */
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let dragSrcIndex = null;

function saveTasks(){ localStorage.setItem('tasks', JSON.stringify(tasks)); }

function renderTasks(){
  const ul = document.getElementById('task-list');
  ul.innerHTML = '';
  tasks.forEach((t,i)=>{
    const li = document.createElement('li');

     // 🔥 Hacemos que el <li> sea arrastrable
    li.draggable = true;

    // 🔥 Guardamos el índice actual dentro del <li>
    li.dataset.index = i; 

    li.innerHTML = `
    <div class="drag-handle">☰</div>

      <label>
        <input type="checkbox" ${t.completed ? 'checked' : ''} data-index="${i}" class="chk">

        <span>${escapeHtml(t.text)}</span>
        <span class="task-time">${t.time ? t.time : ""}</span>

      </label>

      <div>
        <button data-edit="${i}" class="edit-btn" aria-label="Edit task">✏️</button>
        <button data-del="${i}" class="del" aria-label="Delete task">X</button>
      </div>
    `;
    ul.appendChild(li);
  });
}

/* escape simple para evitar inyección */
function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

/* ---------- Operaciones de tareas ---------- */
document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keydown', e=>{ if(e.key==='Enter') addTask(); });

/* ----- Anadir nuevas tareas ----- */
function addTask(){
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if(!text) return;

  tasks.push({
    text: newTaskText,
    completed: false,
    time: "" // ← nuevo campo
    });

  saveTasks();
  renderTasks();

  // animación: marcar el último item con clase 'added'
  const ul = document.getElementById('task-list');
  const last = ul.lastElementChild;
  if(last){
    last.classList.add('added');
    setTimeout(()=> last.classList.remove('added'), 420);
    last.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  input.value = '';
  input.focus();
  pushHistory('Added task: ' + text);
}

/* ----- Editar tareas ----- */
function editTask(i) {
  // Editar texto
  const newText = prompt("Edit task:", tasks[i].text);
  if (newText === null) return; //cancelar

  // Editar hora
  const newTime = prompt("Edit time (HH:MM):", tasks[i].time || "");

  tasks[i].text = newText.trim();
  tasks[i].time = newTime.trim();

  saveTasks();
  renderTasks();
}

/* Delegación para checkbox y delete */
document.getElementById('task-list').addEventListener('click', e=>{
  if (e.target.dataset.edit !== undefined) {
    const i = Number(e.target.dataset.edit);
    editTask(i);
  }
  if(e.target.matches('.del')){
    const i = Number(e.target.dataset.del);
    const removed = tasks.splice(i,1);
    saveTasks(); renderTasks();
    pushHistory('Deleted task: ' + (removed[0]?.text || ''));
  }
  if(e.target.matches('.edit-btn')){
    const i = Number(e.target.dataset.edit);
    const newText = prompt('Edit task:', tasks[i].text);
    if(newText && newText.trim()){
      tasks[i].text = newText.trim();
      saveTasks(); renderTasks();
      pushHistory('Edited task: ' + tasks[i].text);
    }
  }
});

document.getElementById('task-list').addEventListener('change', e=>{
  if(e.target.matches('.chk')){
    const i = Number(e.target.dataset.index);
    const wasCompleted = tasks[i].completed;
    tasks[i].completed = e.target.checked;

    if(e.target.checked && !wasCompleted){
      addPoints(10);
    } else if(!e.target.checked && wasCompleted){
      subtractPoints(10);
    }

    saveTasks(); renderTasks();
    pushHistory('Toggled task: ' + tasks[i].text);
  }
});

/* ---------- Menu y Terminal (abrir/cerrar y click fuera) ---------- */
const menuButton = document.getElementById('menu-button');
const floatingMenu = document.getElementById('floating-menu');
const overlay = document.getElementById('overlay');
const historyTerminal = document.getElementById('history-terminal');
const terminalContent = document.getElementById('terminal-content');
const closeTerminalBtn = document.getElementById('close-terminal');
const sideInfo = document.getElementById('side-info');

function openMenu(){
  floatingMenu.classList.remove('hidden');
  floatingMenu.setAttribute('aria-hidden','false');
  overlay.classList.remove('hidden');
  // no mostrar side-info aquí para evitar que logs aparezcan sin querer
}
function closeMenu(){
  floatingMenu.classList.add('hidden');
  floatingMenu.setAttribute('aria-hidden','true');
  if(!historyTerminal.classList.contains('open')) overlay.classList.add('hidden');
  sideInfo.classList.remove('visible');
}
menuButton.addEventListener('click', e=>{
  e.stopPropagation();
  if(floatingMenu.classList.contains('hidden')) openMenu(); else closeMenu();
});

/* Abrir historial desde menu */
const menuHistory = document.getElementById('menu-history');
if(menuHistory){
  menuHistory.addEventListener('click', e=>{
    e.stopPropagation();
    openHistory();
    closeMenu();
  });
}

/* Abrir terminal */
function openHistory(){
  terminalContent.innerHTML = '';
  const logs = JSON.parse(localStorage.getItem('history') || '[]');
  if(logs.length===0) terminalContent.innerHTML = '<div style="opacity:.6">No history yet.</div>';
  else logs.forEach(l=>{
    const d = document.createElement('div'); d.textContent = l; terminalContent.appendChild(d);
  });
  historyTerminal.classList.add('open');
  historyTerminal.setAttribute('aria-hidden','false');
  overlay.classList.remove('hidden');

  // mostrar panel derecho con logs cuando se abre History
  sideInfo.classList.add('visible');
  sideInfo.setAttribute('aria-hidden','false');
}

/* Cerrar terminal */
function closeHistory(){
  historyTerminal.classList.remove('open');
  historyTerminal.setAttribute('aria-hidden','true');
  if(floatingMenu.classList.contains('hidden')) overlay.classList.add('hidden'); else overlay.classList.remove('hidden');

  // ocultar panel derecho al cerrar historial
  sideInfo.classList.remove('visible');
  sideInfo.setAttribute('aria-hidden','true');
}

/* Botón cerrar dentro del terminal */
if(closeTerminalBtn) closeTerminalBtn.addEventListener('click', e=>{ e.stopPropagation(); closeHistory(); });

/* Click en overlay cierra todo (menu o terminal) */
overlay.addEventListener('click', ()=>{
  closeMenu();
  closeHistory();
});

/* Evitar que clicks dentro del menu o terminal propaguen y cierren */
if(floatingMenu) floatingMenu.addEventListener('click', e=> e.stopPropagation());
if(historyTerminal) historyTerminal.addEventListener('click', e=> e.stopPropagation());

/* Cerrar con ESC */
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape'){ closeMenu(); closeHistory(); }
});

/* ---------- Timer de reset (visible y responsive) ---------- */
function updateResetTimer(){
  const el = document.getElementById('reset-timer');
  const now = new Date();
  const next = new Date(now);
  next.setHours(24,0,0,0);
  const diff = next - now;
  const hrs = Math.floor(diff / (1000*60*60));
  const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
  const secs = Math.floor((diff % (1000*60)) / 1000);
  el.textContent = `Reset in: ${hrs}h ${mins}m ${secs}s`;
}
setInterval(updateResetTimer, 1000);
updateResetTimer();

/* ---------- Inicialización ---------- */
renderTasks();
loadScore();
document.getElementById('float-add-btn').addEventListener('click', addTask);

/* ---------- History helper ---------- */
function pushHistory(text){
  const arr = JSON.parse(localStorage.getItem('history') || '[]');
  arr.unshift(`${new Date().toLocaleString()} - ${text}`);
  if(arr.length>200) arr.pop();
  localStorage.setItem('history', JSON.stringify(arr));
}

/* ----- Eventos de drag & drop ----- */
let dragSrcIndex = null;
const taskList = document.getElementById("task-list");

// ----- Cuando empiezas a arrastrar ------
taskList.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("drag-handle")) {
    dragSrcIndex = Number(e.target.parentElement.dataset.index);
  }
});

// ----- Permitir soltar -----
taskList.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// ----- Cuando sueltas -----
taskList.addEventListener("drop", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  
  const dropIndex = Number(li.dataset.index);

  // ----- mover tarea en el array -----
  const moved = tasks.splice(dragSrcIndex, 1)[0];
  tasks.splice(dropIndex, 0, moved);

  saveTasks();
  renderTasks();
})

// ===============================
// HOLOGRAPHIC PANEL TRANSFORM
// ===============================

const floatBtn = document.getElementById("float-add-btn");
const holoPanel = document.getElementById("holo-panel");
const holoContent = document.querySelector(".holo-content");
const holoClose = document.querySelector(".holo-close");

let holoOpen = false;

// Abrir / Expandir el panel
floatBtn.addEventListener("click", () => {
  if (holoOpen) return;

  holoOpen = true;

  // Ocultar el "+" durante la animación
  floatBtn.style.opacity = "0";

  // Expandir el panel
  holoPanel.classList.add("expanded");

  // Mostrar contenido con glitch + fade
  setTimeout(() => {
    holoContent.style.opacity = "1";
  }, 300);
});

// Cerrar / Contraer el panel
function closeHoloPanel() {
  if (!holoOpen) return;

  holoOpen = false;

  // Ocultar contenido
  holoContent.style.opacity = "0";

  // Contraer panel
  holoPanel.classList.remove("expanded");

  // Mostrar el "+" de nuevo
  setTimeout(() => {
    floatBtn.style.opacity = "1";
  }, 350);
}

// Botón CLOSE
holoClose.addEventListener("click", closeHoloPanel);

// Cerrar tocando fuera del panel
holoPanel.addEventListener("click", (e) => {
  if (e.target === holoPanel) {
    closeHoloPanel();
  }
});
