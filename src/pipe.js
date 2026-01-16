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

function updateAndCheckPipes(
  spritesheet,
  pipeTop,
  pipeBottom,
  GAME_WIDTH,
  GAME_HEIGHT,
  gameSpeed,
  groundHeight,
  isGameOver,
  bird
) {
  let collision = false;
  let scoreIncrement = false;
  if (!isGameOver) {
    pipeTimer++;
    if (pipeTimer >= pipeInterval) {
      pipes.push(
        new Pipe(spritesheet, pipeTop, pipeBottom, GAME_WIDTH, GAME_HEIGHT, gameSpeed, groundHeight)
      );
      pipeTimer = 0;
    }
    pipes.forEach((pipe) => {
      pipe.update();
      if (bird) {
        const collideTop =
          bird.x < pipe.x + pipe.width &&
          bird.x + bird.width > pipe.x &&
          bird.y < pipe.topPipeY + pipe.topPipeHeight &&
          bird.y + bird.height > pipe.topPipeY;

        const collideBottom =
          bird.x < pipe.x + pipe.width &&
          bird.x + (bird.width - 5) > pipe.x &&
          bird.y < pipe.bottomPipeY + pipe.bottomPipeHeight &&
          bird.y + bird.height > pipe.bottomPipeY;

        if (collideTop || collideBottom || bird.y + bird.height >= GAME_HEIGHT - groundHeight) {
          collision = true;
        }
        if (!pipe.passed && bird.x > pipe.x) {
          pipe.passed = true;
          scoreIncrement = true;
        }
      }
    });
    pipes = pipes.filter((pipe) => !pipe.isOffScreen());
  }
  return { collision, scoreIncrement };
}

function resetPipes(){
  pipes = [];
  pipeTimer = 0;
}

export { updateAndCheckPipes, getPipes, resetPipes };
