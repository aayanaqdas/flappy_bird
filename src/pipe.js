let pipes = [];
let pipeTimer = 0;
const pipeInterval = 100;

class Pipe {
  constructor(image, pipeTop, pipeBottom, canvasWidth, canvasHeight, gameSpeed, groundHeight) {
    this.image = image;
    this.x = canvasWidth;
    this.width = 52;
    this.gap = 100;
    this.speed = gameSpeed;
    this.passed = false;
    this.pipeTop = pipeTop;
    this.pipeBottom = pipeBottom;
    this.topPipeHeight = 320;
    this.bottomPipeHeight = 320;

    const minGapY = 60; // Minimum distance from top
    const maxGapY = canvasHeight - groundHeight - this.gap - 60;
    this.gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    // Top pipe ends where gap starts
    this.topPipeY = this.gapY - this.topPipeHeight;

    // Bottom pipe starts where gap ends
    this.bottomPipeY = this.gapY + this.gap;
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.pipeTop.sx,
      this.pipeTop.sy,
      this.pipeTop.sw,
      this.pipeTop.sh,
      this.x,
      this.topPipeY,
      this.width,
      this.topPipeHeight
    );
    ctx.drawImage(
      this.image,
      this.pipeBottom.sx,
      this.pipeBottom.sy,
      this.pipeBottom.sw,
      this.pipeBottom.sh,
      this.x,
      this.bottomPipeY,
      this.width,
      this.bottomPipeHeight
    );
  }

  update() {
    this.x -= this.speed;
  }
  isOffScreen() {
    return this.x + this.width < 0;
  }
}

function getPipes() {
  return pipes;
}

function createPipes(
  spritesheet,
  pipeTop,
  pipeBottom,
  GAME_WIDTH,
  GAME_HEIGHT,
  gameSpeed,
  groundHeight
) {
  pipeTimer++;
  if (pipeTimer >= pipeInterval) {
    pipes.push(
      new Pipe(spritesheet, pipeTop, pipeBottom, GAME_WIDTH, GAME_HEIGHT, gameSpeed, groundHeight)
    );
    pipeTimer = 0;
  }

  pipes = pipes.filter((pipe) => !pipe.isOffScreen());
}

export { createPipes, getPipes };
