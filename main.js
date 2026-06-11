let tasks = [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
}

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
            <button onclick="deleteTask(${index})">X</button>
        `;

        ul.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById("task-input");
    const text = input.value.trim();
    if (!text) return;

    tasks.push({ text, completed: false });
    saveTasks();
    renderTasks();
    input.value = "";
}

function toggleTask(i) {
    tasks[i].completed = !tasks[i].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(i) {
    tasks.splice(i, 1);
    saveTasks();
    renderTasks();
}

/* MENÚ */
const menuButton = document.getElementById("menu-button");
const floatingMenu = document.getElementById("floating-menu");

menuButton.onclick = () => {
    floatingMenu.style.display =
        floatingMenu.style.display === "flex" ? "none" : "flex";
};

/* INIT */
loadTasks();
renderTasks();
loadScore();
updateResetTimer();
