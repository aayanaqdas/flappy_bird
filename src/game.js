import { drawBird, getBird } from "./bird.js";
import { createPipes, getPipes } from "./pipe.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

const gameSpeed = 2;

let isPaused = false;

const bgImage = new Image();
const groundImage = new Image();
const birdImageDf = new Image();
const birdImageMf = new Image();
const birdImageUf = new Image();
const pipeImageBottom = new Image();
const pipeImageTop = new Image();
bgImage.src = "./sprites/background-day.png";
groundImage.src = "./sprites/base.png";
birdImageDf.src = "./sprites/yellowbird-downflap.png";
birdImageMf.src = "./sprites/yellowbird-midflap.png";
birdImageUf.src = "./sprites/yellowbird-upflap.png";

pipeImageBottom.src = "./sprites/pipe-green-bottom.png";
pipeImageTop.src = "./sprites/pipe-green-top.png";

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
  birdImageMf,
  birdImageUf,
  pipeImageTop,
  pipeImageBottom,
];

loadImages(spriteImages)
  .then(() => {
    drawGame();
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
}

class Layer {
  constructor(image, x, y, width, height, speedModifier) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedModifier = speedModifier;
  }

  update(gameSpeed) {
    this.x -= gameSpeed * this.speedModifier;
    if (this.x <= -this.width) {
      this.x += this.width;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
  }
}

function checkCollision() {
  const bird = getBird();
  const pipes = getPipes();

  pipes.forEach((pipe) => {
    // Check collision with top pipe
    const collideTop =
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      bird.y < pipe.topPipeY + pipe.topPipeHeight &&
      bird.y + bird.height > pipe.topPipeY;

    // Check collision with bottom pipe
    const collideBottom =
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      bird.y < pipe.bottomPipeY + pipe.bottomPipeHeight &&
      bird.y + bird.height > pipe.bottomPipeY;

    if (collideTop || collideBottom) {
      console.log("collision");
      isPaused = true;
    }
  });
}

const bgLayer = new Layer(bgImage, 0, 0, GAME_WIDTH, GAME_HEIGHT, 0.3);
const groundLayer = new Layer(groundImage, 0, GAME_HEIGHT - 112, GAME_WIDTH, 112, 1);

function drawGame() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  bgLayer.update(gameSpeed);
  bgLayer.draw(ctx);

  createPipes(ctx, GAME_WIDTH, GAME_HEIGHT, pipeImageTop, pipeImageBottom, gameSpeed);

  groundLayer.update(gameSpeed);
  groundLayer.draw(ctx);

  drawBird(ctx, birdImageDf, GAME_HEIGHT);
  checkCollision();
  if (!isPaused) {
    requestAnimationFrame(drawGame);
  }
}

window.addEventListener("resize", initCanvas);
initCanvas();
