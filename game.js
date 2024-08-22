const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width = window.innerWidth * 0.8;
const canvasHeight = canvas.height = window.innerHeight * 0.8;

const cellSize = 40;
const mazeRows = Math.floor(canvasHeight / cellSize);
const mazeCols = Math.floor(canvasWidth / cellSize);

const player = { x: 1, y: 1, radius: 15 };
const goal = { x: mazeCols - 3, y: mazeRows - 3, radius: 15 };

const maze = Array.from({ length: mazeRows }, () => Array(mazeCols).fill(0));
const mazeVisibility = Array.from({ length: mazeRows }, () => Array(mazeCols).fill(false));

for (let i = 0; i < mazeRows; i++) {
    for (let j = 0; j < mazeCols; j++) {
        if (Math.random() < 0.2 && (i !== player.y || j !== player.x) && (i !== goal.y || j !== goal.x)) {
            maze[i][j] = 1;
        }
    }
}

let pulsesLeft = 5;
let pulseRadius = 0;
let pulseActive = false;
let pulseOpacity = 1;
const pulseDuration = 2000;
const visibilityDuration = 3000;
let pulseEndTime = 0;
let visibilityEndTime = 0;

const initialTime = 60;
let remainingTime = initialTime;
let timerInterval;

function drawMaze() {
    ctx.fillStyle = "#4b4b4b";
    for (let row = 0; row < mazeRows; row++) {
        for (let col = 0; col < mazeCols; col++) {
            if (mazeVisibility[row][col] && maze[row][col] === 1) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                ctx.strokeStyle = "#333";
                ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff5733";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawGoal() {
    ctx.beginPath();
    ctx.arc(goal.x * cellSize + cellSize / 2, goal.y * cellSize + cellSize / 2, goal.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#28a745";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawPulse() {
    if (pulseActive && Date.now() < pulseEndTime) {
        pulseRadius += 5;
        pulseOpacity -= 0.02;
        ctx.beginPath();
        ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    } else {
        pulseActive = false;
        pulseRadius = 0;
        pulseOpacity = 1;
        if (Date.now() > visibilityEndTime) {
            mazeVisibility.forEach((row, i) => row.fill(false));
        }
    }
}

function drawTimer() {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.fillText(`Time Left: ${Math.max(0, Math.ceil(remainingTime))}s`, canvas.width - 20, 30);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX >= 0 && newX < mazeCols && newY >= 0 && newY < mazeRows && maze[newY][newX] === 0) {
        player.x = newX;
        player.y = newY;
    }
}

function checkWin() {
    if (player.x === goal.x && player.y === goal.y) {
        showPopup("You Win!");
        document.getElementById("pulseBtn").disabled = true;
        clearInterval(timerInterval);
    }
}

function updateTimer() {
    remainingTime -= 1;
    if (remainingTime <= 0) {
        showPopup("Time's Up!");
        document.getElementById("pulseBtn").disabled = true;
        clearInterval(timerInterval);
    }
}

function showPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 2000); // Popup duration
}

function gameLoop() {
    clearCanvas();
    drawMaze();
    drawPlayer();
    drawGoal();
    drawPulse();
    drawTimer();
    checkWin();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Add a click event to ensure the user interacts with the page before playing audio
    document.body.addEventListener('click', () => {
        backgroundMusic.play().catch(error => {
            console.log("Audio playback failed:", error);
        });
    });

    // Start the game loop
    gameLoop();
});

timerInterval = setInterval(updateTimer, 1000);

const joystick = nipplejs.create({
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: { top: 'auto', left: 'auto' },
    color: '#007bff',
    size: 120
});

joystick.on('move', (event, data) => {
    if (data.direction) {
        switch (data.direction.angle) {
            case 'up':
                movePlayer(0, -1);
                break;
            case 'down':
                movePlayer(0, 1);
                break;
            case 'left':
                movePlayer(-1, 0);
                break;
            case 'right':
                movePlayer(1, 0);
                break;
        }
    }
});

document.getElementById('pulseBtn').addEventListener('click', () => {
    if (pulsesLeft > 0) {
        pulsesLeft--;
        document.getElementById('message').textContent = `Pulses Left: ${pulsesLeft}`;
        pulseActive = true;
        pulseEndTime = Date.now() + pulseDuration;
        visibilityEndTime = Date.now() + visibilityDuration;
        mazeVisibility.forEach((row, i) => row.fill(true));
    } else {
        showPopup("No Pulses Left!");
    }
});

mazeVisibility.forEach(row => row.fill(false));

// Start the game loop
gameLoop();
