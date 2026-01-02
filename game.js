const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

const gameSpeed = 2;

let pipes = [];
let pipeTimer = 0;
const pipeInterval = 100;

const bgImage = new Image();
const groundImage = new Image();
const birdImage = new Image();
const pipeImageBottom = new Image();
const pipeImageTop = new Image();
bgImage.src = "./sprites/background-day.png";
groundImage.src = "./sprites/base.png";
birdImage.src = "./sprites/yellowbird-downflap.png";
pipeImageBottom.src = "./sprites/pipe-green-bottom.png";
pipeImageTop.src = "./sprites/pipe-green-top.png";

let imagesLoaded = 0;
const totalImages = 5;

function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    drawGame();
  }
}

bgImage.onload = imageLoaded;
groundImage.onload = imageLoaded;
birdImage.onload = imageLoaded;
pipeImageTop.onload = imageLoaded;
pipeImageBottom.onload = imageLoaded;

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

class Pipe {
  constructor(canvasWidth, canvasHeight, topImage, bottomImage) {
    this.x = canvasWidth;
    this.width = topImage.width;
    this.gap = 150;
    this.speed = gameSpeed;
    this.passed = false;

    this.topImg = topImage;
    this.bottomImg = bottomImage;

    this.topPipeHeight = topImage.height;
    this.bottomPipeHeight = bottomImage.height;

    const groundHeight = 112;
    const minGapY = 60; // Minimum distance from top
    const maxGapY = canvasHeight - groundHeight - this.gap - 60;
    this.gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    // Top pipe ends where gap starts
    this.topPipeY = this.gapY - this.topPipeHeight;

    // Bottom pipe starts where gap ends
    this.bottomPipeY = this.gapY + this.gap;
  }

  draw(ctx) {
    ctx.drawImage(this.topImg, this.x, this.topPipeY, this.width, this.topPipeHeight);
    ctx.drawImage(this.bottomImg, this.x, this.bottomPipeY, this.width, this.bottomPipeHeight);
  }

  update() {
    this.x -= this.speed;
  }
  isOffScreen() {
    return this.x + this.width < 0;
  }
}

function createPipes() {
  pipeTimer++;
  if (pipeTimer >= pipeInterval) {
    pipes.push(new Pipe(GAME_WIDTH, GAME_HEIGHT, pipeImageTop, pipeImageBottom));
    pipeTimer = 0;
  }

  pipes.forEach((pipe) => {
    pipe.update();
    pipe.draw(ctx);
  });

  pipes = pipes.filter((pipe) => !pipe.isOffScreen());
}

const bgLayer = new Layer(bgImage, 0, 0, GAME_WIDTH, GAME_HEIGHT, 0.3);
const groundLayer = new Layer(groundImage, 0, GAME_HEIGHT - 112, GAME_WIDTH, 112, 1);

function drawGame() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  bgLayer.update(gameSpeed);
  bgLayer.draw(ctx);

  createPipes();

  groundLayer.update(gameSpeed);
  groundLayer.draw(ctx);

  ctx.drawImage(birdImage, 30, GAME_HEIGHT / 2, 44, 34);
  requestAnimationFrame(drawGame);
}

window.addEventListener("resize", initCanvas);
initCanvas();
