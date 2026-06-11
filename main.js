let tasks = [];

/* -----------------------------
   LOAD & SAVE TASKS
------------------------------*/
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const stored = localStorage.getItem("tasks");
    tasks = stored ? JSON.parse(stored) : [];
}

/* -----------------------------
   RENDER TASKS
------------------------------*/
function renderTasks() {
    const ul = document.getElementById("task-list");
    ul.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <label>
                <input type="checkbox" onchange="toggleTask(${index})" ${task.completed ? "checked" : ""}>
                ${task.text}
            </label>

            <button onclick="deleteTask(${index})"
            style="
                background:#ff00aa;
                color:white;
                border:none;
                cursor:pointer;
                padding:2px 6px;
                font-size:10px;
                border-radius:4px;
            ">
                DELETE
            </button>
        `;

        if (task.completed) {
            li.style.opacity = "0.4";
            li.style.textDecoration = "line-through";
        }

        ul.appendChild(li);
    });
}

/* -----------------------------
   ADD TASK
------------------------------*/
function addTask() {
    const input = document.getElementById("task-input");
    const taskText = input.value.trim();
    if (taskText === "") return;

    tasks.push({ text: taskText, completed: false });
    saveTasks();
    renderTasks();
    input.value = "";
}

/* -----------------------------
   TOGGLE TASK
------------------------------*/
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;

    if (tasks[index].completed) addPoints(10);
    else subtractPoints(10);

    saveTasks();
    renderTasks();
}

/* -----------------------------
   DELETE TASK
------------------------------*/
function deleteTask(index) {
    subtractPoints(5);
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

/* -----------------------------
   RESET AT MIDNIGHT
   (Saves to history before clearing)
------------------------------*/
function resetTasks() {
    addDayToHistory(tasks, score); // from history.js
    tasks = [];
    saveTasks();
    renderTasks();
}

/* -----------------------------
   MENU FLOATING BUTTON
------------------------------*/
const menuButton = document.getElementById("menu-button");
const floatingMenu = document.getElementById("floating-menu");

menuButton.addEventListener("click", () => {
    floatingMenu.style.display =
        floatingMenu.style.display === "flex" ? "none" : "flex";
});

/* -----------------------------
   INIT
------------------------------*/
loadTasks();
renderTasks();
loadScore();       // from score.js
updateResetTimer(); // from timer.js
