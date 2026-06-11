let historyData = JSON.parse(localStorage.getItem("history")) || [];

function saveHistory() {
    localStorage.setItem("history", JSON.stringify(historyData));
}

function addDayToHistory(tasks, score) {
    const today = new Date().toISOString().split("T")[0];

    historyData.push({
        date: today,
        tasks: tasks,
        score: score
    });

    saveHistory();
}

function openHistory() {
    const terminal = document.getElementById("history-terminal");
    terminal.innerHTML = "";

    terminal.style.right = "0px";

    const lines = [
        "> ACCESSING LOGS...",
        "> CONNECTING TO ARCHIVE NODE 07...",
        "> DECRYPTING...",
        ""
    ];

    historyData.forEach(entry => {
        lines.push(`[${entry.date}]`);
        entry.tasks.forEach(t => {
            lines.push(`  ${t.completed ? "✓" : "✗"} ${t.text}`);
        });
        lines.push(`  Score: ${entry.score}`);
        lines.push("");
        lines.push("> END OF LOG");
        lines.push("");
    });

    typeLines(lines, terminal);
}

function typeLines(lines, terminal) {
    let i = 0;

    function nextLine() {
        if (i >= lines.length) return;

        const line = document.createElement("div");
        line.className = "log-line";
        terminal.appendChild(line);

        let j = 0;

        function typeChar() {
            if (j < lines[i].length) {
                line.textContent += lines[i][j];
                j++;
                setTimeout(typeChar, 10);
            } else {
                i++;
                setTimeout(nextLine, 50);
            }
        }

        typeChar();
    }

    nextLine();
}

