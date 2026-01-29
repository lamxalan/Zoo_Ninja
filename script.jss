const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const lengthElement = document.getElementById("length");
const statusElement = document.getElementById("status");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");

const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const DIRECTIONS = {
  ArrowUp: -GRID_SIZE,
  ArrowDown: GRID_SIZE,
  ArrowLeft: -1,
  ArrowRight: 1,
  w: -GRID_SIZE,
  s: GRID_SIZE,
  a: -1,
  d: 1,
};

let cells = [];
let snake = [44];
let direction = DIRECTIONS.ArrowRight;
let nextDirection = direction;
let apple = 55;
let score = 0;
let gameTimer = null;
let isRunning = false;
let hasWon = false;

const buildBoard = () => {
  boardElement.innerHTML = "";
  cells = Array.from({ length: TOTAL_CELLS }, (_, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("data-index", index);
    boardElement.appendChild(cell);
    return cell;
  });
};

const updateStats = () => {
  scoreElement.textContent = score;
  lengthElement.textContent = snake.length;
};

const updateStatus = (message) => {
  statusElement.textContent = message;
};

const draw = () => {
  cells.forEach((cell) => {
    cell.classList.remove("snake", "head", "apple");
  });

  snake.forEach((index, idx) => {
    const cell = cells[index];
    if (!cell) return;
    cell.classList.add("snake");
    if (idx === 0) {
      cell.classList.add("head");
    }
  });

  if (apple !== null && cells[apple]) {
    cells[apple].classList.add("apple");
  }
};

const randomApple = () => {
  if (snake.length === TOTAL_CELLS) {
    apple = null;
    return;
  }

  let index;
  do {
    index = Math.floor(Math.random() * TOTAL_CELLS);
  } while (snake.includes(index));

  apple = index;
};

const resetGameState = () => {
  snake = [44];
  direction = DIRECTIONS.ArrowRight;
  nextDirection = direction;
  score = 0;
  hasWon = false;
  randomApple();
  updateStats();
  updateStatus("Press Start");
  draw();
};

const stopGame = () => {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  isRunning = false;
  startButton.disabled = false;
};

const startGame = () => {
  if (isRunning || hasWon) return;
  isRunning = true;
  startButton.disabled = true;
  updateStatus("Snake is vibing...");
  gameTimer = setInterval(step, 220);
};

const isOppositeDirection = (newDir) => {
  return newDir + direction === 0;
};

const step = () => {
  direction = nextDirection;
  const head = snake[0];
  const next = head + direction;

  const hitWall =
    next < 0 ||
    next >= TOTAL_CELLS ||
    (direction === -1 && head % GRID_SIZE === 0) ||
    (direction === 1 && head % GRID_SIZE === GRID_SIZE - 1);

  if (hitWall || snake.includes(next)) {
    updateStatus("Game over! Hit reset to try again.");
    stopGame();
    return;
  }

  snake.unshift(next);

  if (next === apple) {
    score += 1;
    randomApple();
  } else {
    snake.pop();
  }

  if (snake.length === TOTAL_CELLS) {
    hasWon = true;
    updateStatus("You win! The grid is full.");
    stopGame();
  }

  updateStats();
  draw();
};

const handleKey = (event) => {
  const key = event.key;
  if (!Object.prototype.hasOwnProperty.call(DIRECTIONS, key)) return;

  const newDirection = DIRECTIONS[key];
  if (isOppositeDirection(newDirection)) return;
  nextDirection = newDirection;
};

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", () => {
  stopGame();
  resetGameState();
});
window.addEventListener("keydown", handleKey);

buildBoard();
resetGameState();
