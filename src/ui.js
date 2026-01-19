import { gameState } from "./gameStates.js";
import { BUTTONS } from "./uiEvents.js";
import { getBird } from "./bird.js";

const GAME_WIDTH = gameState.GAME_WIDTH;
const GAME_HEIGHT = gameState.GAME_HEIGHT;

let ctx;
let spritesheet;
let sprites;
let sparkles = [];

const LAYOUT_CONFIG = {
  logo: {
    width: 220,
    height: 58,
    xOffset: 30,
    yOffsetFromBird: -10,
    defaultY: 110,
  },
  gameOver: {
    width: 220,
    height: 58,
    y: 100,
  },
  readyMessage: {
    width: 220,
    height: 58,
    y: 100,
  },
  tapMessage: {
    width: 90,
    height: 110,
    yOffset: 28,
  },
};

function drawButton(sprite, buttonConfig) {
  ctx.drawImage(
    spritesheet,
    sprite.sx,
    sprite.sy,
    sprite.sw,
    sprite.sh,
    buttonConfig.x,
    buttonConfig.y,
    buttonConfig.w,
    buttonConfig.h
  );
}

// Score Display
const DIGIT_CONFIG = {
  height: 26,
  spacing: 2,
  widths: { default: 18, narrow: 14 },
};

function getDigitWidth(digit) {
  return parseInt(digit) === 1 ? DIGIT_CONFIG.widths.narrow : DIGIT_CONFIG.widths.default;
}

function calculateScoreWidth(scoreStr) {
  let totalWidth = 0;
  for (let i = 0; i < scoreStr.length; i++) {
    totalWidth += getDigitWidth(scoreStr[i]);
    if (i < scoreStr.length - 1) totalWidth += DIGIT_CONFIG.spacing;
  }
  return totalWidth;
}

function drawScore(score, x, y) {
  const digits = sprites.digits;
  const scoreStr = score.toString();
  const totalWidth = calculateScoreWidth(scoreStr);

  let startX = typeof x === "number" ? x - totalWidth : (GAME_WIDTH - totalWidth) / 2;
  const startY = y || 20;

  for (let i = 0; i < scoreStr.length; i++) {
    const scoreDigit = parseInt(scoreStr[i]);
    const digitWidth = getDigitWidth(scoreStr[i]);
    const digit = digits[scoreDigit];

    ctx.drawImage(
      spritesheet,
      digit.sx,
      digit.sy,
      digit.sw,
      digit.sh,
      startX,
      startY,
      digitWidth,
      DIGIT_CONFIG.height
    );

    startX += digitWidth + DIGIT_CONFIG.spacing;
  }
}

// Sparkle Effects for medal
const SPARKLE_CONFIG = {
  count: 1,
  frameDelay: 6,
  sizeMultiplier: 2,
};

function createSparkle(centerX, centerY, radius) {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * radius;

  return {
    x: centerX + Math.cos(angle) * dist,
    y: centerY + Math.sin(angle) * dist,
    frame: Math.floor(Math.random() * sprites.sparkleFrames.length),
    frameDelay: 0,
    centerX,
    centerY,
    radius,
  };
}

function repositionSparkle(sparkle) {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * sparkle.radius;
  sparkle.x = sparkle.centerX + Math.cos(angle) * dist;
  sparkle.y = sparkle.centerY + Math.sin(angle) * dist;
  sparkle.frame = 0;
}

function updateSparkles(centerX, centerY, radius) {
  if (sparkles.length === 0) {
    for (let i = 0; i < SPARKLE_CONFIG.count; i++) {
      sparkles.push(createSparkle(centerX, centerY, radius));
    }
  }

  sparkles.forEach((sparkle) => {
    sparkle.frameDelay++;

    if (sparkle.frameDelay >= SPARKLE_CONFIG.frameDelay) {
      sparkle.frameDelay = 0;
      sparkle.frame++;

      if (sparkle.frame >= sprites.sparkleFrames.length) {
        repositionSparkle(sparkle);
      }
    }

    const frame = sprites.sparkleFrames[sparkle.frame];
    const size = frame.sw * SPARKLE_CONFIG.sizeMultiplier;

    ctx.drawImage(
      spritesheet,
      frame.sx,
      frame.sy,
      frame.sw,
      frame.sh,
      sparkle.x - size / 2,
      sparkle.y - size / 2,
      size,
      size
    );
  });
}

// Medal System
const MEDAL_THRESHOLDS = {
  platinum: 50,
  gold: 30,
  silver: 20,
  bronze: 10,
};

const MEDAL_CONFIG = {
  size: 53,
  xOffset: 31,
  yOffset: 7,
  sparkleRadiusOffset: 5,
};

function getMedal(score) {
  if (score >= MEDAL_THRESHOLDS.platinum) return sprites.medals.platinum;
  if (score >= MEDAL_THRESHOLDS.gold) return sprites.medals.gold;
  if (score >= MEDAL_THRESHOLDS.silver) return sprites.medals.silver;
  if (score >= MEDAL_THRESHOLDS.bronze) return sprites.medals.bronze;
  return null;
}

function drawMedal(medal, scoreBoardX, scoreBoardY, scoreBoardHeight) {
  const { size, xOffset, yOffset, sparkleRadiusOffset } = MEDAL_CONFIG;
  const medalX = scoreBoardX + xOffset;
  const medalY = scoreBoardY + scoreBoardHeight / 2 - (size / 2 - yOffset);

  ctx.drawImage(spritesheet, medal.sx, medal.sy, medal.sw, medal.sh, medalX, medalY, size, size);

  const centerX = medalX + size / 2;
  const centerY = medalY + size / 2;
  const sparkleRadius = size / 2 - sparkleRadiusOffset;

  updateSparkles(centerX, centerY, sparkleRadius);
}

// Scoreboard
const SCOREBOARD_CONFIG = {
  width: 266,
  height: 137,
  scoreXOffset: 25,
  scoreYOffset: 40,
  bestScoreYOffset: 90,
  newLabelWidth: 36,
  newLabelHeight: 18,
  newLabelXOffset: 105,
  newLabelYOffset: 68,
};

function drawScoreboard() {
  const { score, bestScore } = gameState;
  const { scoreBoard } = sprites;
  const { width, height } = SCOREBOARD_CONFIG;

  const x = (GAME_WIDTH - width) / 2;
  const y = (GAME_HEIGHT - height) / 2;
  const isNewScore = score > bestScore;

  ctx.drawImage(
    spritesheet,
    scoreBoard.sx,
    scoreBoard.sy,
    scoreBoard.sw,
    scoreBoard.sh,
    x,
    y,
    width,
    height
  );

  drawScore(score, x + width - SCOREBOARD_CONFIG.scoreXOffset, y + SCOREBOARD_CONFIG.scoreYOffset);
  drawScore(
    isNewScore ? score : bestScore,
    x + width - SCOREBOARD_CONFIG.scoreXOffset,
    y + SCOREBOARD_CONFIG.bestScoreYOffset
  );

  if (isNewScore) {
    const newLabel = sprites.messages.newScore;
    ctx.drawImage(
      spritesheet,
      newLabel.sx,
      newLabel.sy,
      newLabel.sw,
      newLabel.sh,
      x + width - SCOREBOARD_CONFIG.newLabelXOffset,
      y + SCOREBOARD_CONFIG.newLabelYOffset,
      SCOREBOARD_CONFIG.newLabelWidth,
      SCOREBOARD_CONFIG.newLabelHeight
    );
    localStorage.setItem("bestScore", score);
  }

  const medal = getMedal(score);
  if (medal) {
    drawMedal(medal, x, y, height);
  } else {
    sparkles = [];
  }
}

function drawMenu() {
  const fblogo = sprites.messages.logo;
  const bird = getBird();
  const { width, height, xOffset, yOffsetFromBird, defaultY } = LAYOUT_CONFIG.logo;
  const logoY = bird ? bird.y + yOffsetFromBird : defaultY;

  ctx.drawImage(
    spritesheet,
    fblogo.sx,
    fblogo.sy,
    fblogo.sw,
    fblogo.sh,
    xOffset,
    logoY,
    width,
    height
  );

  drawButton(sprites.buttons.start, BUTTONS.start);
  drawButton(sprites.buttons.score, BUTTONS.score);
}

function drawReadyUI() {
  const readyMsg = sprites.messages.ready;
  const tapMsg = sprites.messages.tap;
  const readyLayout = LAYOUT_CONFIG.readyMessage;
  const tapLayout = LAYOUT_CONFIG.tapMessage;

  ctx.drawImage(
    spritesheet,
    readyMsg.sx,
    readyMsg.sy,
    readyMsg.sw,
    readyMsg.sh,
    (GAME_WIDTH - readyLayout.width) / 2,
    readyLayout.y,
    readyLayout.width,
    readyLayout.height
  );

  ctx.drawImage(
    spritesheet,
    tapMsg.sx,
    tapMsg.sy,
    tapMsg.sw,
    tapMsg.sh,
    GAME_WIDTH / 2 - tapLayout.yOffset,
    GAME_WIDTH / 2 + tapLayout.yOffset,
    tapLayout.width,
    tapLayout.height
  );

  drawScore(gameState.score);
  drawButton(sprites.buttons.pause, BUTTONS.pause);
}

function drawPlayingUI() {
  drawScore(gameState.score);
  drawButton(sprites.buttons.pause, BUTTONS.pause);
}

function drawPausedUI() {
  drawScore(gameState.score);
  drawButton(sprites.buttons.resume, BUTTONS.resume);

  if (gameState.wasPausedFromReady()) {
    drawReadyUI();
    drawButton(sprites.buttons.resume, BUTTONS.resume);
  }
}

function drawGameOverScreen() {
  const gameOverMsg = sprites.messages.gameOver;
  const { width, height, y } = LAYOUT_CONFIG.gameOver;

  ctx.drawImage(
    spritesheet,
    gameOverMsg.sx,
    gameOverMsg.sy,
    gameOverMsg.sw,
    gameOverMsg.sh,
    (GAME_WIDTH - width) / 2,
    y,
    width,
    height
  );

  drawScoreboard();
  drawButton(sprites.buttons.ok, BUTTONS.ok);
  drawButton(sprites.buttons.share, BUTTONS.share);
}

function initUI(spriteMap) {
  ctx = gameState.ctx;
  spritesheet = gameState.spritesheet;
  sprites = {
    digits: spriteMap.digits,
    messages: spriteMap.messages,
    buttons: spriteMap.buttons,
    scoreBoard: spriteMap.scoreBoard,
    medals: spriteMap.medals,
    sparkleFrames: spriteMap.sparkleFrames,
  };
}

function drawUI() {
  if (gameState.isMenu()) {
    drawMenu();
  } else if (gameState.isReady()) {
    drawReadyUI();
  } else if (gameState.isPlaying()) {
    drawPlayingUI();
  } else if (gameState.isPaused()) {
    drawPausedUI();
  } else if (gameState.isGameOver()) {
    drawGameOverScreen();
  }
}

export { initUI, drawUI };
