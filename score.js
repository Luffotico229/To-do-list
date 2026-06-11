let score = 0;

function loadScore() {
    const stored = localStorage.getItem("score");
    score = stored ? parseInt(stored) : 0;
    updateScoreUI();
}

function saveScore() {
    localStorage.setItem("score", score);
}

function addPoints(points) {
    score += points;
    saveScore();
    updateScoreUI();
}

function subtractPoints(points) {
    score -= points;
    if (score < 0) score = 0;
    saveScore();
    updateScoreUI();
}

function updateScoreUI() {
    const el = document.getElementById("score");
    if (el) el.textContent = score;
}
