/* ---------- Datos y persistencia ---------- */
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks(){ localStorage.setItem('tasks', JSON.stringify(tasks)); }
function renderTasks(){
  const ul = document.getElementById('task-list');
  ul.innerHTML = '';
  tasks.forEach((t,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <label>
        <input type="checkbox" ${t.completed ? 'checked' : ''} data-index="${i}" class="chk">
        <span>${escapeHtml(t.text)}</span>
      </label>
      <div>
        <button data-del="${i}" class="del">X</button>
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

function addTask(){
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if(!text) return;
  tasks.push({ text, completed:false });
  saveTasks(); renderTasks();
  input.value = '';
}

/* Delegación para checkbox y delete */
document.getElementById('task-list').addEventListener('click', e=>{
  if(e.target.matches('.del')){
    const i = Number(e.target.dataset.del);
    tasks.splice(i,1); saveTasks(); renderTasks();
  }
});
document.getElementById('task-list').addEventListener('change', e=>{
  if(e.target.matches('.chk')){
    const i = Number(e.target.dataset.index);
    tasks[i].completed = e.target.checked;
    saveTasks(); renderTasks();
  }
});

/* ---------- Menu y Terminal (abrir/cerrar y click fuera) ---------- */
const menuButton = document.getElementById('menu-button');
const floatingMenu = document.getElementById('floating-menu');
const overlay = document.getElementById('overlay');
const historyTerminal = document.getElementById('history-terminal');
const terminalContent = document.getElementById('terminal-content');
const closeTerminalBtn = document.getElementById('close-terminal');

function openMenu(){
  floatingMenu.classList.remove('hidden');
  floatingMenu.setAttribute('aria-hidden','false');
  overlay.classList.remove('hidden');
}
function closeMenu(){
  floatingMenu.classList.add('hidden');
  floatingMenu.setAttribute('aria-hidden','true');
  if(!historyTerminal.classList.contains('open')) overlay.classList.add('hidden');
}
menuButton.addEventListener('click', e=>{
  e.stopPropagation();
  if(floatingMenu.classList.contains('hidden')) openMenu(); else closeMenu();
});

/* Abrir historial desde menu */
document.getElementById('menu-history').addEventListener('click', e=>{
  e.stopPropagation();
  openHistory();
  closeMenu();
});

/* Abrir terminal */
function openHistory(){
  // llenar contenido simple (puedes personalizar)
  terminalContent.innerHTML = '';
  const logs = JSON.parse(localStorage.getItem('history') || '[]');
  if(logs.length===0) terminalContent.innerHTML = '<div style="opacity:.6">No history yet.</div>';
  else logs.forEach(l=>{
    const d = document.createElement('div'); d.textContent = l; terminalContent.appendChild(d);
  });
  historyTerminal.classList.add('open');
  historyTerminal.setAttribute('aria-hidden','false');
  overlay.classList.remove('hidden');
}

/* Cerrar terminal */
function closeHistory(){
  historyTerminal.classList.remove('open');
  historyTerminal.setAttribute('aria-hidden','true');
  if(floatingMenu.classList.contains('hidden')) overlay.classList.add('hidden'); else overlay.classList.remove('hidden');
}

/* Botón cerrar dentro del terminal */
closeTerminalBtn.addEventListener('click', e=>{ e.stopPropagation(); closeHistory(); });

/* Click en overlay cierra todo (menu o terminal) */
overlay.addEventListener('click', ()=>{
  closeMenu();
  closeHistory();
});

/* Evitar que clicks dentro del menu o terminal propaguen y cierren */
floatingMenu.addEventListener('click', e=> e.stopPropagation());
historyTerminal.addEventListener('click', e=> e.stopPropagation());

/* Cerrar con ESC */
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape'){ closeMenu(); closeHistory(); }
});

/* ---------- Inicialización ---------- */
renderTasks();

/* ---------- Opcional: guardar acciones en history (ejemplo) ---------- */
function pushHistory(text){
  const arr = JSON.parse(localStorage.getItem('history') || '[]');
  arr.unshift(`${new Date().toLocaleString()} - ${text}`);
  if(arr.length>100) arr.pop();
  localStorage.setItem('history', JSON.stringify(arr));
}

/* Ejemplos de hooks para history: */
document.getElementById('add-btn').addEventListener('click', ()=> pushHistory('Added task'));
document.getElementById('task-list').addEventListener('click', e=>{
  if(e.target.matches('.del')) pushHistory('Deleted task');
});
document.getElementById('task-list').addEventListener('change', e=>{
  if(e.target.matches('.chk')) pushHistory('Toggled task');
});
