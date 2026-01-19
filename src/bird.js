import { gameState } from "./gameStates.js";
import { playSound } from "./audio.js";

let bird = null;
let isDead = false;
let controlsInitialized = false;
let lastState = null;

class Bird {
  constructor(birdFrames) {
    this.image = gameState.spritesheet;
    this.width = 40;
    this.height = 28;
    this.velocity = 0;
    this.gravity = 0.25;
    this.flap = -4.6;
    this.maxFallSpeed = 10;

    this.rotation = 0;
    this.groundY = gameState.GAME_HEIGHT - gameState.groundY - this.height;

    this.frames = birdFrames;
    this.currentFrame = 0;

    this.frameTimer = 0;
    this.frameInterval = 5;

    this.menuBobSpeed = 0.1;
    this.menuBobAmount = 7;
    this.menuBobOffset = 0;

    this.x = gameState.GAME_WIDTH - (this.width + 30);
    this.y = 110;

    this.hasInitialJump = false;
  }

  draw() {
    const ctx = gameState.ctx;

    if (!gameState.isPaused() && !gameState.isGameOver()) {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.currentFrame = this.currentFrame + 1;
        this.frameTimer = 0;
      }
      if (this.currentFrame >= this.frames.length) {
        this.currentFrame = 0;
      }
    }

    const frame = this.frames[this.currentFrame];

    ctx.save();
    // Rotate bird based on velocity
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.drawImage(
      this.image,
      frame.sx,
      frame.sy,
      frame.sw,
      frame.sh,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
  update() {
    if (isDead) {
      this.velocity += this.gravity * 2;
      this.y += this.velocity;
      if (this.rotation < 90) this.rotation += 10;
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocity = 0;
        this.rotation = 90;
      }
      return;
    }

    if (gameState.isMenu()) {
      this.x = gameState.GAME_WIDTH - (this.width + 30);
      this.menuBobOffset += this.menuBobSpeed;
      this.y = 110 + Math.sin(this.menuBobOffset) * this.menuBobAmount;
      this.rotation = 0;
      this.velocity = 0;
    }

    if (gameState.isReady()) {
      this.x = 80;
      this.menuBobOffset += this.menuBobSpeed;
      this.y =
        gameState.GAME_WIDTH / 2 + this.height + Math.sin(this.menuBobOffset) * this.menuBobAmount;
      this.velocity = 0;
      this.rotation = 0;
    }

    if (gameState.isPlaying()) {
      this.x = 80;

      if (!this.hasInitialJump) {
        this.velocity = this.flap;
        this.rotation = -25;

        this.hasInitialJump = true;
      }

      this.velocity = Math.min(this.velocity + this.gravity, this.maxFallSpeed);
      this.y += this.velocity;

      // Clamp velocity between 2.5 (start turning) and 6.5 (full nosedive)
      const clampVel = Math.min(Math.max(this.velocity, 2.5), 6.5);

      // Map that range directly to rotation (-25 to 90)
      this.rotation = -25 + (clampVel - 2.5) * (115 / 4);

      // Ground collision
      if (this.y >= this.groundY) {
        this.die();
        this.y = this.groundY;
        this.velocity = 0;
        this.rotation = 90;
        gameState.gameOver();
      }
    }
  }
  jump() {
    if (gameState.isPlaying()) {
      playSound("flap");
      this.velocity = this.flap;
      this.rotation = -4.6;
      
    }
  }

  die() {
    playSound("hit");
    isDead = true;
  }
  reset() {
    isDead = false;
    this.x = gameState.GAME_WIDTH - (this.width + 30);
    this.y = 110;
    this.menuBobOffset = 0;
    this.rotation = 0;
    this.velocity = 0;
    this.hasInitialJump = false;
    this.currentFrame = 0;
  }
}

function birdControls(bird) {
  if (controlsInitialized) return;
  controlsInitialized = true;

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      bird.jump();
    }
  });

  document.addEventListener("pointerdown", (e) => {
    bird.jump();
  });
}

function getBird() {
  return bird;
}

function drawBird(birdFrames) {
  if (!bird) {
    bird = new Bird(birdFrames);
    birdControls(bird);
  }

  const currentState = gameState.currentState;
  if (currentState === "MENU" && lastState !== "MENU") {
    bird.reset();
  }
  lastState = currentState;

  bird.update();
  bird.draw();
}

export { drawBird, getBird };
