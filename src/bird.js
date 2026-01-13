let bird = null;
let isPaused = false;
let hasJumped = false;
let controlsInitialized = false;

class Bird {
  constructor(image, birdFrames, GAME_HEIGHT, groundHeight) {
    this.image = image;
    this.x = 80;
    this.y = GAME_HEIGHT / 2 - 30;
    this.width = 35;
    this.height = 24;
    this.velocity = 0;
    this.gravity = 0.4;
    this.flap = -6;
    this.rotation = 0;
    this.groundY = GAME_HEIGHT - groundHeight - this.height;

    this.frames = birdFrames;
    this.currentFrame = 0;

    this.frameTimer = 0;
    this.frameInterval = 8;
  }

  draw(ctx) {
    ctx.save();

    if (!isPaused) {
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
    ctx.drawImage;

    ctx.restore();
  }
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Update rotation based on velocity (-20° to 90°)
    if (this.velocity < 0) {
      this.rotation = Math.max(-20, this.velocity * 3);
    } else {
      this.rotation = Math.min(90, this.velocity * 4);
    }

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocity = 0;
      this.rotation = 90;
    }
  }
  jump() {
    if (!isPaused) {
      this.velocity = this.flap;
    }
  }
}

function birdControls(bird) {
  if (controlsInitialized) return; // Prevent multiple listener registrations
  controlsInitialized = true;
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      bird.jump();
      hasJumped = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      hasJumped = false;
    }
  });

  document.addEventListener("mousedown", () => {
    bird.jump();
  });

  // document.addEventListener("touchstart", (e) => {
  //   e.preventDefault();
  //   bird.jump();
  // });
}

function getBird() {
  return bird;
}

function drawBird(ctx, spritesheet, birdFrames, GAME_HEIGHT, isGameOver, groundHeight) {
  isPaused = isGameOver;
  if (!bird) {
    bird = new Bird(spritesheet, birdFrames, GAME_HEIGHT, groundHeight);
    birdControls(bird);
  }

  bird.update();
  bird.draw(ctx);
}

export { drawBird, getBird };
