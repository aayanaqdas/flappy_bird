import { drawBird, getBird } from "./bird.js";
import { createPipes, getPipes } from "./pipe.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
const pipeImageBottom = new Image();
const pipeImageTop = new Image();
const spritesheet = new Image();

const scoreImages = [];
for (let i = 0; i <= 9; i++) {
  const img = new Image();
  img.src = `./sprites/${i}.png`;
  scoreImages.push(img);
}
const scoreboardImage = new Image();

bgImage.src = "./sprites/background-day.png";
groundImage.src = "./sprites/base.png";
pipeImageBottom.src = "./sprites/pipe-green-bottom.png";
pipeImageTop.src = "./sprites/pipe-green-top.png";
gameOverImage.src = "./sprites/gameover.png";
scoreboardImage.src = "./sprites/scoreboard.png";
spritesheet.src = "./sprites/flappybird_spritesheet.png";

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
  spritesheet,
  bgImage,
  groundImage,
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
  const dpr = window.devicePixelRatio || 1;

  //Calculate CSS display size based on full height
  const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
  const displayWidth = GAME_WIDTH * scale;
  const displayHeight = GAME_HEIGHT * scale;

  //Set internal resolution (Multiplied by dpr for sharpness)
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  //Set CSS display size
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  //RESET context settings
  ctx.imageSmoothingEnabled = false; //

  //Scale all drawing operations to match the resolution
  ctx.scale(dpr * scale, dpr * scale);

  //Apply CSS rendering hints for the browser upscaler
  canvas.style.imageRendering = "pixelated"; //
  canvas.style.imageRendering = "crisp-edges"; // Fallback for Firefox
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

function drawScore(x, y) {
  const scoreStr = score.toString();
  const digitWidth = scoreImages[0].width;
  const digitHeight = scoreImages[0].height;
  const spacing = 2;

  const totalWidth = digitWidth * scoreStr.length + spacing * (scoreStr.length - 1);

  // If x is provided, align the right edge of the last digit to x
  let startX = typeof x === "number" ? x - totalWidth : (GAME_WIDTH - totalWidth) / 2;
  const startY = y ? y : 20;

  for (let i = 0; i < scoreStr.length; i++) {
    const digit = parseInt(scoreStr[i]);
    ctx.drawImage(scoreImages[digit], startX, startY, digitWidth, digitHeight);
    startX += digitWidth + spacing;
  }
}

function drawScoreboard() {
  ctx.drawImage(
    scoreboardImage,
    GAME_WIDTH / 2 - scoreboardImage.width / 2,
    GAME_HEIGHT / 2 - scoreboardImage.height / 2
  );
  drawScore(scoreboardImage.width + 10, GAME_HEIGHT / 2 - 25);
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
  drawBird(ctx, spritesheet, GAME_HEIGHT, isGameOver, groundHeight);

  ctx.drawImage(groundImage, groundX, GAME_HEIGHT - groundHeight, GAME_WIDTH, groundHeight);
  ctx.drawImage(
    groundImage,
    groundX + GAME_WIDTH,
    GAME_HEIGHT - groundHeight,
    GAME_WIDTH,
    groundHeight
  );

  if (isGameOver) {
    ctx.drawImage(gameOverImage, GAME_WIDTH / 2 - gameOverImage.width / 2, 120);
    drawScoreboard();
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
