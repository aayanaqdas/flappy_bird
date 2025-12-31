const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;
const SPEED = 1;

const groundHeight = 112;
let groundX = 0;
let bgX = 0;

const bgImage = new Image();
const groundImage = new Image();
const birdImage = new Image();
bgImage.src = "./sprites/background-day.png";
groundImage.src = "./sprites/base.png";
birdImage.src = "./sprites/yellowbird-downflap.png";

function initCanvas() {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
}


function drawGame() {
  // Move ground image
  groundX -= SPEED;
  if (groundX <= -GAME_WIDTH) {
    groundX = 0;
  }
  //Move bg image
  bgX -= SPEED;
  if (bgX <= -GAME_WIDTH) {
    bgX = 0;
  }


  // Draw two ground images for seamless looping
  ctx.drawImage(bgImage, bgX, 0, GAME_WIDTH, GAME_HEIGHT - groundHeight);
  ctx.drawImage(bgImage, bgX + GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT - groundHeight);

  ctx.drawImage(groundImage, groundX, GAME_HEIGHT - groundHeight, GAME_WIDTH, groundHeight);
  ctx.drawImage(
    groundImage,
    groundX + GAME_WIDTH,
    GAME_HEIGHT - groundHeight,
    GAME_WIDTH,
    groundHeight
  );

  ctx.drawImage(birdImage, 30, GAME_HEIGHT / 2, 44, 34);

  //Creates a game loop
  requestAnimationFrame(drawGame);
}

window.addEventListener("resize", initCanvas);
initCanvas();
drawGame();
