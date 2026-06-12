function getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { hours, minutes, seconds, diff };
}

function updateResetTimer() {
    const t = getTimeUntilMidnight();
    const timerEl = document.getElementById("reset-timer");

    if (t.diff <= 0) {
        resetTasks();
        return;
    }

    timerEl.textContent = `Reset in: ${t.hours}h ${t.minutes}m ${t.seconds}s`;

}

setInterval(updateResetTimer, 1000);

