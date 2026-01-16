let bird = null;
let isPaused = false;
let isDead = false;
let controlsInitialized = false;

class Bird {
  constructor(image, birdFrames, GAME_HEIGHT, groundHeight) {
    this.image = image;
    this.x = 80;
    this.y = GAME_HEIGHT / 2 - 30;
    this.width = 35;
    this.height = 24;
    this.velocity = 0;
    this.gravity = 0.3;
    this.flap = -5.5;
    this.rotation = 0;
    this.maxFallSpeed = 8;
    this.groundY = GAME_HEIGHT - groundHeight - this.height;

    this.frames = birdFrames;
    this.currentFrame = 0;

    this.frameTimer = 0;
    this.frameInterval = 6;
  }

  draw(ctx) {
    if (!isPaused && !isDead) {
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

    this.velocity += this.gravity;
    if (this.velocity > this.maxFallSpeed) {
      this.velocity = this.maxFallSpeed;
    }
    this.y += this.velocity;

    // --- ROTATION LOGIC ---
    if (this.velocity < 0) {
      //Snap to -20 degrees instantly
      this.rotation = -20;
    } else if (this.velocity >= 0 && this.velocity < 3) {
      // hang time: Stay at -20 degrees
      // The bird doesnt start rotating down until it has reached fall speed
      this.rotation = -20;
    } else {
      //rotate toward 90 degrees for dive
      if (this.rotation < 90) {
        this.rotation += 8;
      }
    }

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocity = 0;
      this.rotation = 90;
    }
  }
  jump() {
    if (!isPaused && !isDead) {
      this.velocity = this.flap;
      this.rotation = -20;
    }
  }

  die() {
    isDead = true;
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

function resetBird() {
  bird = null;
  isDead = false;
  controlsInitialized = false;
}

export { drawBird, getBird, resetBird };
