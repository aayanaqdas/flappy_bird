import { spriteMap } from "./spriteMap.js";
import { drawBird, getBird } from "./bird.js";
import { updateAndCheckPipes, getPipes } from "./pipe.js";
import { initUI, drawGameOverScreen, drawScore } from "./ui.js";

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

function drawPipes() {
  const pipes = getPipes();
  const bird = getBird();

  const result = updateAndCheckPipes(
    spritesheet,
    pipeTop,
    pipeBottom,
    GAME_WIDTH,
    GAME_HEIGHT,
    gameSpeed,
    groundHeight,
    isGameOver,
    bird
  );
  if (result.collision) {
    bird.die();
    isGameOver = true;
  } else if (result.scoreIncrement) {
    score++;
  }
  pipes.forEach((pipe) => pipe.draw(ctx));
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
    drawGameOverScreen(score, bestScore);
  } else {
    drawScore(score);
  }
}

function gameLoop() {
  drawGame();
  if (!isGamePaused) {
    requestAnimationFrame(gameLoop);
  }
}

spritesheet.onload = () => {
  initCanvas();
  initUI(ctx, spritesheet, spriteMap, GAME_WIDTH, GAME_HEIGHT);

  window.addEventListener("resize", initCanvas);
  gameLoop();
};
