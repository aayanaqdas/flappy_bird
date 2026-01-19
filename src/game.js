import { spriteMap } from "./spriteMap.js";
import { drawBird, getBird } from "./bird.js";
import { updateAndCheckPipes } from "./pipe.js";
import { initUI, drawUI } from "./ui.js";
import { initUIEvents } from "./uiEvents.js";
import { gameState } from "./gameStates.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = gameState.GAME_WIDTH;
const GAME_HEIGHT = gameState.GAME_HEIGHT;
const groundHeight = gameState.groundHeight;

const spritesheet = new Image();
spritesheet.src = "./sprites/spritesheet.png";

const bg = spriteMap.background;
const ground = spriteMap.ground;
const pipeTop = spriteMap.pipeTop;
const pipeBottom = spriteMap.pipeBottom;
const birdFrames = spriteMap.birdFrames;

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
function drawPipesAndCheckCollisions() {
  const bird = getBird();
  if (!bird) return;

  const result = updateAndCheckPipes(pipeTop, pipeBottom, bird);

  if (result.collision) {
    bird.die();
    gameState.gameOver();
  } else if (result.scoreIncrement) {
    gameState.incrementScore();
  }
}

function drawGame() {
  gameState.updateGroundX();

  ctx.drawImage(spritesheet, bg.sx, bg.sy, bg.sw, bg.sh, 0, 0, GAME_WIDTH, GAME_HEIGHT + 50);
  drawPipesAndCheckCollisions();
  drawBird(birdFrames);

  ctx.drawImage(
    spritesheet,
    ground.sx,
    ground.sy,
    ground.sw,
    ground.sh,
    gameState.groundX,
    GAME_HEIGHT - gameState.groundY,
    GAME_WIDTH,
    groundHeight
  );
  ctx.drawImage(
    spritesheet,
    ground.sx,
    ground.sy,
    ground.sw,
    ground.sh,
    gameState.groundX + GAME_WIDTH,
    GAME_HEIGHT - gameState.groundY,
    GAME_WIDTH,
    groundHeight
  );

  drawUI();
}

function gameLoop() {
  drawGame();
  requestAnimationFrame(gameLoop);
}

spritesheet.onload = () => {
  gameState.init(canvas, ctx, spritesheet);
  initCanvas();
  initUI(spriteMap);
  initUIEvents();
  window.addEventListener("resize", initCanvas);
  gameLoop();
};
