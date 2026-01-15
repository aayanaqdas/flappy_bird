import { spriteMap } from "./spriteMap.js";
import { drawBird, getBird } from "./bird.js";
import { createPipes, getPipes } from "./pipe.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = 330;
const GAME_HEIGHT = 480;

const gameSpeed = 2;
let score = 0;
const bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
let isGameOver = false;
let isStarted = false;
let isGamePaused = false;

let groundX = 0;
const groundHeight = 100;

const spritesheet = new Image();
spritesheet.src = "./sprites/spritesheet.png";

const bg = spriteMap.background;
const ground = spriteMap.ground;
const pipeTop = spriteMap.pipeTop;
const pipeBottom = spriteMap.pipeBottom;
const scoreBoard = spriteMap.scoreBoard;
const birdFrames = spriteMap.birdFrames;
const messages = spriteMap.messages;
const buttons = spriteMap.buttons;
const medals = spriteMap.medals;
const digits = spriteMap.digits;

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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;

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
    createPipes(spritesheet, pipeTop, pipeBottom, GAME_WIDTH, GAME_HEIGHT, gameSpeed, groundHeight);
  }

  pipes.forEach((pipe) => {
    if (!isGameOver) {
      pipe.update();
      checkCollision(pipe);
    }
    pipe.draw(ctx);
  });
}

function drawScore(scoreType, x, y) {
  const scoreStr = scoreType ? scoreType.toString() : score.toString();
  const digitHeight = 26;
  const spacing = 2;

  // Calculate total width accounting for narrow 1s
  let totalWidth = 0;
  for (let i = 0; i < scoreStr.length; i++) {
    totalWidth += parseInt(scoreStr[i]) === 1 ? 14 : 18;
    if (i < scoreStr.length - 1) totalWidth += spacing;
  }

  // If x is provided, align the right edge of the last digit to x
  let startX = typeof x === "number" ? x - totalWidth : (GAME_WIDTH - totalWidth) / 2;
  const startY = y ? y : 20;

  for (let i = 0; i < scoreStr.length; i++) {
    const scoreDigit = parseInt(scoreStr[i]);
    const digitWidth = scoreDigit === 1 ? 14 : 18;
    const digit = digits[scoreDigit];
    ctx.drawImage(
      spritesheet,
      digit.sx,
      digit.sy,
      digit.sw,
      digit.sh,
      startX,
      startY,
      digitWidth,
      digitHeight
    );
    startX += digitWidth + spacing;
  }
}

function drawScoreboard() {
  const scoreBoardWidth = 266;
  const scoreBoardHeight = 137;
  const scoreBoardX = (GAME_WIDTH - scoreBoardWidth) / 2;
  const scoreBoardY = (GAME_HEIGHT - scoreBoardHeight) / 2 - 5;
  let medal = null;
  const isNewScore = score > bestScore;
  ctx.drawImage(
    spritesheet,
    scoreBoard.sx,
    scoreBoard.sy,
    scoreBoard.sw,
    scoreBoard.sh,
    scoreBoardX,
    scoreBoardY,
    scoreBoardWidth,
    scoreBoardHeight
  );

  drawScore(score, scoreBoardX + scoreBoardWidth - 25, scoreBoardY + 40);
  drawScore(isNewScore ? score : bestScore, scoreBoardX + scoreBoardWidth - 25, scoreBoardY + 90);

  if (isNewScore) {
    const newLabel = messages.newScore;
    ctx.drawImage(
      spritesheet,
      newLabel.sx,
      newLabel.sy,
      newLabel.sw,
      newLabel.sh,
      scoreBoardX + scoreBoardWidth - 105,
      scoreBoardY + 68,
      36,
      18
    );
    localStorage.setItem("bestScore", score);
  }

  if (score >= 100) {
    medal = medals.platinum;
  } else if (score >= 50) {
    medal = medals.gold;
  } else if (score >= 20) {
    medal = medals.silver;
  } else if (score >= 10) {
    medal = medals.bronze;
  }

  if (medal) {
    const medalSize = 53;
    const medalX = scoreBoardX + 31;
    const medalY = scoreBoardY + scoreBoardHeight / 2 - (medalSize / 2 - 7);

    ctx.drawImage(
      spritesheet,
      medal.sx,
      medal.sy,
      medal.sw,
      medal.sh,
      medalX,
      medalY,
      medalSize,
      medalSize
    );
  }
}

function drawGameOverScreen() {
  const gameOverMsg = messages.gameOver;
  const startBtn = buttons.ok;
  ctx.drawImage(
    spritesheet,
    gameOverMsg.sx,
    gameOverMsg.sy,
    gameOverMsg.sw,
    gameOverMsg.sh,
    (GAME_WIDTH - 220) / 2,
    110,
    220,
    48
  );
  drawScoreboard();
}

function drawGame() {
  if (!isGameOver) {
    groundX -= gameSpeed;
    if (groundX <= -GAME_WIDTH) {
      groundX += GAME_WIDTH;
    }
  }

  ctx.drawImage(spritesheet, bg.sx, bg.sy, bg.sw, bg.sh, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawPipes();
  drawBird(ctx, spritesheet, birdFrames, GAME_HEIGHT, isGameOver, groundHeight);

  ctx.drawImage(
    spritesheet,
    ground.sx,
    ground.sy,
    ground.sw,
    ground.sh,
    groundX,
    GAME_HEIGHT - groundHeight,
    GAME_WIDTH,
    groundHeight
  );
  ctx.drawImage(
    spritesheet,
    ground.sx,
    ground.sy,
    ground.sw,
    ground.sh,
    groundX + GAME_WIDTH,
    GAME_HEIGHT - groundHeight,
    GAME_WIDTH,
    groundHeight
  );

  if (isGameOver) {
    drawGameOverScreen();
  } else {
    drawScore();
  }
}

function gameLoop() {
  drawGame();
  requestAnimationFrame(gameLoop);
}

spritesheet.onload = () => {
  initCanvas();
  window.addEventListener("resize", initCanvas);
  gameLoop();
};
