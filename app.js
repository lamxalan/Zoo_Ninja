const animalBank = [
  { name: "Lion", type: "Mammals", image: "assets/animals/lion.svg" },
  { name: "Tiger", type: "Mammals", image: "assets/animals/tiger.svg" },
  { name: "Panda", type: "Mammals", image: "assets/animals/panda.svg" },
  { name: "Giraffe", type: "Mammals", image: "assets/animals/giraffe.svg" },
  { name: "Kangaroo", type: "Mammals", image: "assets/animals/kangaroo.svg" },
  { name: "Sloth", type: "Mammals", image: "assets/animals/sloth.svg" },
  { name: "Dog", type: "Mammals", image: "assets/animals/dog.svg" },
  { name: "Cat", type: "Mammals", image: "assets/animals/cat.svg" },
  { name: "Cow", type: "Mammals", image: "assets/animals/cow.svg" },
  { name: "Sheep", type: "Mammals", image: "assets/animals/sheep.svg" },
  { name: "Penguin", type: "Birds", image: "assets/animals/penguin.svg" },
  { name: "Parrot", type: "Birds", image: "assets/animals/parrot.svg" },
  { name: "Owl", type: "Birds", image: "assets/animals/owl.svg" },
  { name: "Frog", type: "Amphibians", image: "assets/animals/frog.svg" },
  { name: "Turtle", type: "Reptiles", image: "assets/animals/turtle.svg" },
  { name: "Snake", type: "Reptiles", image: "assets/animals/snake.svg" },
  { name: "Shark", type: "Fish", image: "assets/animals/shark.svg" },
  { name: "Butterfly", type: "Insects", image: "assets/animals/butterfly.svg" },
];

const categories = [...new Set(animalBank.map((animal) => animal.type))];

const gameArea = document.getElementById("gameArea");
const sliceTrail = document.getElementById("sliceTrail");

const roundDisplay = document.getElementById("roundDisplay");
const categoryDisplay = document.getElementById("categoryDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const correctDisplay = document.getElementById("correctDisplay");
const mistakeDisplay = document.getElementById("mistakeDisplay");

const startScreen = document.getElementById("startScreen");
const instructionsScreen = document.getElementById("instructionsScreen");
const leaderboardScreen = document.getElementById("leaderboardScreen");
const roundScreen = document.getElementById("roundScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const instructionsButton = document.getElementById("instructionsButton");
const leaderboardButton = document.getElementById("leaderboardButton");
const closeInstructions = document.getElementById("closeInstructions");
const closeLeaderboard = document.getElementById("closeLeaderboard");
const nextRoundButton = document.getElementById("nextRoundButton");
const restartButton = document.getElementById("restartButton");
const saveScoreButton = document.getElementById("saveScoreButton");

const leaderboardList = document.getElementById("leaderboardList");
const roundTitle = document.getElementById("roundTitle");
const roundMessage = document.getElementById("roundMessage");
const gameOverMessage = document.getElementById("gameOverMessage");
const playerNameInput = document.getElementById("playerName");

let round = 1;
let score = 0;
let correct = 0;
let mistakes = 0;
let targetCategory = categories[0];
let isSlicing = false;
let animationId = null;
let spawnTimer = null;
let lastTimestamp = 0;
let activeAnimals = [];
let gameActive = false;

const leaderboardKey = "zooNinjaLeaderboard";

const requiredForRound = (roundNumber) => 3 + (roundNumber - 1) * 2;

const updateScoreboard = () => {
  roundDisplay.textContent = round;
  categoryDisplay.textContent = targetCategory;
  scoreDisplay.textContent = score;
  correctDisplay.textContent = `${correct}/${requiredForRound(round)}`;
  mistakeDisplay.textContent = `${mistakes}/3`;
};

const showOverlay = (overlay) => {
  overlay.classList.remove("overlay--hidden");
};

const hideOverlay = (overlay) => {
  overlay.classList.add("overlay--hidden");
};

const setTargetCategory = () => {
  const randomIndex = Math.floor(Math.random() * categories.length);
  targetCategory = categories[randomIndex];
};

const resetRound = () => {
  correct = 0;
  mistakes = 0;
  setTargetCategory();
};

const clearAnimals = () => {
  activeAnimals.forEach(({ element }) => element.remove());
  activeAnimals = [];
};

const resetGame = () => {
  round = 1;
  score = 0;
  resetRound();
  clearAnimals();
  updateScoreboard();
};

const spawnAnimal = () => {
  const animal = animalBank[Math.floor(Math.random() * animalBank.length)];
  const element = document.createElement("div");
  element.className = "fruit";
  element.innerHTML = `
    <img src="${animal.image}" alt="${animal.name}" />
    <span>${animal.name}</span>
  `;

  const areaRect = gameArea.getBoundingClientRect();
  const x = Math.random() * (areaRect.width - 120) + 60;
  const y = -50;
  const speed = 60 + Math.random() * 60 + round * 8;

  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.dataset.type = animal.type;
  element.dataset.sliced = "false";

  gameArea.appendChild(element);
  activeAnimals.push({ element, x, y, speed, animal });
};

const addSliceDot = (x, y) => {
  const dot = document.createElement("div");
  dot.className = "slice-dot";
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  sliceTrail.appendChild(dot);
  setTimeout(() => dot.remove(), 600);
};

const handleSlice = (entry) => {
  if (entry.element.dataset.sliced === "true") return;
  entry.element.dataset.sliced = "true";
  entry.element.classList.add("fruit--sliced");
  setTimeout(() => entry.element.remove(), 200);
  activeAnimals = activeAnimals.filter((animal) => animal !== entry);

  if (entry.animal.type === targetCategory) {
    score += 10;
    correct += 1;
  } else {
    mistakes += 1;
  }
  updateScoreboard();

  if (mistakes >= 3) {
    endGame();
  } else if (correct >= requiredForRound(round)) {
    completeRound();
  }
};

const sliceAt = (x, y) => {
  addSliceDot(x, y);
  activeAnimals.forEach((entry) => {
    const rect = entry.element.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      handleSlice(entry);
    }
  });
};

const gameLoop = (timestamp) => {
  if (!gameActive) return;
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  const areaRect = gameArea.getBoundingClientRect();
  activeAnimals.forEach((entry) => {
    entry.y += entry.speed * delta;
    entry.element.style.top = `${entry.y}px`;
  });

  activeAnimals = activeAnimals.filter((entry) => {
    if (entry.y > areaRect.height + 120) {
      entry.element.remove();
      return false;
    }
    return true;
  });

  animationId = requestAnimationFrame(gameLoop);
};

const startLoop = () => {
  gameActive = true;
  lastTimestamp = 0;
  animationId = requestAnimationFrame(gameLoop);
  spawnTimer = setInterval(spawnAnimal, 900);
};

const stopLoop = () => {
  gameActive = false;
  if (animationId) cancelAnimationFrame(animationId);
  if (spawnTimer) clearInterval(spawnTimer);
};

const completeRound = () => {
  stopLoop();
  roundTitle.textContent = `Round ${round} Complete!`;
  roundMessage.textContent = `You sliced ${correct} correct animals! Ready for the next challenge?`;
  showOverlay(roundScreen);
};

const endGame = () => {
  stopLoop();
  gameOverMessage.textContent = `You scored ${score} points in ${round} rounds.`;
  showOverlay(gameOverScreen);
};

const startRound = () => {
  resetRound();
  clearAnimals();
  updateScoreboard();
  startLoop();
};

const startGame = () => {
  resetGame();
  hideOverlay(startScreen);
  hideOverlay(roundScreen);
  hideOverlay(gameOverScreen);
  startLoop();
};

const getLeaderboard = () => {
  try {
    return JSON.parse(localStorage.getItem(leaderboardKey)) || [];
  } catch (error) {
    return [];
  }
};

const saveLeaderboard = (entries) => {
  localStorage.setItem(leaderboardKey, JSON.stringify(entries));
};

const updateLeaderboardUI = () => {
  const entries = getLeaderboard();
  leaderboardList.innerHTML = "";
  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No scores yet — be the first!";
    leaderboardList.appendChild(empty);
    return;
  }
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${entry.name}</span><span>${entry.score}</span>`;
    leaderboardList.appendChild(item);
  });
};

const saveScore = () => {
  const name = playerNameInput.value.trim() || "Zoo Hero";
  const entries = getLeaderboard();
  entries.push({ name, score });
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, 5);
  saveLeaderboard(trimmed);
  updateLeaderboardUI();
};

startButton.addEventListener("click", startGame);
instructionsButton.addEventListener("click", () => showOverlay(instructionsScreen));
leaderboardButton.addEventListener("click", () => {
  updateLeaderboardUI();
  showOverlay(leaderboardScreen);
});
closeInstructions.addEventListener("click", () => hideOverlay(instructionsScreen));
closeLeaderboard.addEventListener("click", () => hideOverlay(leaderboardScreen));
nextRoundButton.addEventListener("click", () => {
  round += 1;
  hideOverlay(roundScreen);
  startRound();
});
restartButton.addEventListener("click", () => {
  hideOverlay(gameOverScreen);
  startGame();
});
saveScoreButton.addEventListener("click", () => {
  saveScore();
  playerNameInput.value = "";
  hideOverlay(gameOverScreen);
  showOverlay(leaderboardScreen);
});

const handlePointerDown = (event) => {
  isSlicing = true;
  sliceAt(event.clientX, event.clientY);
};

const handlePointerMove = (event) => {
  if (!isSlicing || !gameActive) return;
  sliceAt(event.clientX, event.clientY);
};

const handlePointerUp = () => {
  isSlicing = false;
};

gameArea.addEventListener("pointerdown", handlePointerDown);
gameArea.addEventListener("pointermove", handlePointerMove);
gameArea.addEventListener("pointerup", handlePointerUp);
gameArea.addEventListener("pointerleave", handlePointerUp);

updateScoreboard();
updateLeaderboardUI();
