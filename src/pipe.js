let pipes = [];
let pipeTimer = 0;
const pipeInterval = 100;

class Pipe {
  constructor(canvasWidth, canvasHeight, topImage, bottomImage, gameSpeed) {
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

function getPipes(){
  return pipes;
}

function createPipes(ctx, GAME_WIDTH, GAME_HEIGHT, pipeImageTop, pipeImageBottom, gameSpeed) {
  pipeTimer++;
  if (pipeTimer >= pipeInterval) {
    pipes.push(new Pipe(GAME_WIDTH, GAME_HEIGHT, pipeImageTop, pipeImageBottom, gameSpeed));
    pipeTimer = 0;
  }

  pipes.forEach((pipe) => {
    pipe.update();
    pipe.draw(ctx);
  });

  pipes = pipes.filter((pipe) => !pipe.isOffScreen());
}

export { createPipes, getPipes };
