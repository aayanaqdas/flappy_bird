import { gameState } from "./gameStates.js";

let pipes = [];
let pipeTimer = 0;
const pipeInterval = 100;

class Pipe {
  constructor(pipeTop, pipeBottom) {
    this.image = gameState.spritesheet;
    this.x = gameState.GAME_WIDTH;
    this.width = 60;
    this.gap = 105;
    this.speed = gameState.gameSpeed;
    this.passed = false;
    this.pipeTop = pipeTop;
    this.pipeBottom = pipeBottom;
    this.topPipeHeight = 320;
    this.bottomPipeHeight = 320;

    const minGapY = 60;
    const maxGapY = gameState.GAME_HEIGHT - gameState.groundHeight - this.gap - 60;
    this.gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    this.topPipeY = this.gapY - this.topPipeHeight;
    this.bottomPipeY = this.gapY + this.gap;
  }

  draw() {
    const ctx = gameState.ctx;
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

  checkCollision(bird) {
    if (!bird) return false;

    const collideTop =
      bird.x < this.x + this.width &&
      bird.x + bird.width > this.x &&
      bird.y < this.topPipeY + this.topPipeHeight &&
      bird.y + bird.height > this.topPipeY;

    const collideBottom =
      bird.x < this.x + this.width &&
      bird.x + bird.width > this.x &&
      bird.y < this.bottomPipeY + this.bottomPipeHeight &&
      bird.y + bird.height > this.bottomPipeY;

    return collideTop || collideBottom;
  }

  checkPassed(bird) {
    if (!bird) return false;

    if (!this.passed && bird.x > this.x) {
      this.passed = true;
      return true;
    }
    return false;
  }
}

function updateAndCheckPipes(pipeTop, pipeBottom, bird) {
  let collision = false;
  let scoreIncrement = false;

  pipes.forEach((pipe) => pipe.draw());

  if (gameState.isPlaying()) {
    pipeTimer++;
    if (pipeTimer >= pipeInterval) {
      pipes.push(new Pipe(pipeTop, pipeBottom));
      pipeTimer = 0;
    }

    pipes.forEach((pipe) => {
      pipe.update();

      if (bird) {
        if (pipe.checkCollision(bird)) {
          collision = true;
        }

        if (pipe.checkPassed(bird)) {
          scoreIncrement = true;
        }
      }
    });

    pipes = pipes.filter((pipe) => !pipe.isOffScreen());
  }

  return { collision, scoreIncrement };
}

function resetPipes() {
  pipes = [];
  pipeTimer = 0;
}

export { updateAndCheckPipes, resetPipes };
