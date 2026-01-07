import { drawBird, getBird } from "./bird.js";
import { createPipes, getPipes } from "./pipe.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const GAME_WIDTH = 330;
const GAME_HEIGHT = 480;

const gameSpeed = 2;
let score = 0;

let isGameOver = false;
let isStarted = false;
let isGamePaused = false;

let groundX = 0;
const groundHeight = 100;

const bgImage = new Image();
const groundImage = new Image();
const gameOverImage = new Image();
const birdImageDf = new Image();
const pipeImageBottom = new Image();
const pipeImageTop = new Image();

const scoreImages = [];
for (let i = 0; i <= 9; i++) {
  const img = new Image();
  img.src = `./sprites/${i}.png`;
  scoreImages.push(img);
}

bgImage.src = "./sprites/background-day.png";
groundImage.src = "./sprites/base.png";
birdImageDf.src = "./sprites/yellowbird-downflap.png";
pipeImageBottom.src = "./sprites/pipe-green-bottom.png";
pipeImageTop.src = "./sprites/pipe-green-top.png";
gameOverImage.src = "./sprites/gameover.png";

function loadImages(imageList) {
  const promises = imageList.map((img) => {
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  });
  return Promise.all(promises);
}

const spriteImages = [
  bgImage,
  groundImage,
  birdImageDf,
  pipeImageTop,
  pipeImageBottom,
  gameOverImage,
  ...scoreImages,
];

loadImages(spriteImages)
  .then(() => {
    gameLoop();
  })
  .catch((err) => {
    console.error("Failed to load images:", err);
  });

function initCanvas() {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
  canvas.style.imageRendering = "pixelated";
  canvas.style.imageRendering = "crisp-edges";
}
function checkCollision(pipe) {
  const bird = getBird();
  if (bird && pipe) {
    const collideTop =
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      bird.y < pipe.topPipeY + pipe.topPipeHeight &&
      bird.y + bird.height > pipe.topPipeY;

    const collideBottom =
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      bird.y < pipe.bottomPipeY + pipe.bottomPipeHeight &&
      bird.y + bird.height > pipe.bottomPipeY;

    if (collideTop || collideBottom) {
      console.log("collision");
      isGameOver = true;
    }
    if (!pipe.passed && bird.x > pipe.x) {
      pipe.passed = true;
      score++;
    }
  }
}

function drawPipes() {
  const pipes = getPipes();
  if (!isGameOver) {
    createPipes(GAME_WIDTH, GAME_HEIGHT, pipeImageTop, pipeImageBottom, gameSpeed, groundHeight);
  }

  pipes.forEach((pipe) => {
    if (!isGameOver) {
      pipe.update();
      checkCollision(pipe);
    }
    pipe.draw(ctx);
  });
}

function drawScore() {
  const scoreStr = score.toString();
  const digitWidth = scoreImages[0].width;
  const digitHeight = scoreImages[0].height * 0.6;
  const spacing = 2;

  const totalWidth = digitWidth * scoreStr.length + spacing * (scoreStr.length - 1);
  let startX = (GAME_WIDTH - totalWidth) / 2;
  const startY = 30;

  for (let i = 0; i < scoreStr.length; i++) {
    const digit = parseInt(scoreStr[i]);
    ctx.drawImage(scoreImages[digit], startX, startY, digitWidth, digitHeight);
    startX += digitWidth + spacing;
  }
}

function drawGame() {
  if (!isGameOver) {
    groundX -= gameSpeed;
    if (groundX <= -GAME_WIDTH) {
      groundX += GAME_WIDTH;
    }
  }

  ctx.drawImage(bgImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

  drawPipes();
  drawBird(ctx, birdImageDf, GAME_HEIGHT, isGameOver, groundHeight);

  ctx.drawImage(groundImage, groundX, GAME_HEIGHT - groundHeight, GAME_WIDTH, groundHeight);
  ctx.drawImage(
    groundImage,
    groundX + GAME_WIDTH,
    GAME_HEIGHT - groundHeight,
    GAME_WIDTH,
    groundHeight
  );

  if (isGameOver) {
    ctx.drawImage(gameOverImage, GAME_WIDTH / 2 - gameOverImage.width / 2, 100);
  } else {
    drawScore();
  }
}

function gameLoop() {
  drawGame();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", initCanvas);
initCanvas();
