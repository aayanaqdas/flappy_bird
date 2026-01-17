import { gameState } from "./gameStates.js";
import { getBird } from "./bird.js";

const GAME_WIDTH = gameState.GAME_WIDTH;
const GAME_HEIGHT = gameState.GAME_HEIGHT;

let ctx;
let spritesheet;
let sprites;
let sparkles = [];

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

  gameState.canvas.addEventListener("click", (e) => {
    console.log(e.x, e.y);
  });
}

function drawScore(score, x, y) {
  const digits = sprites.digits;
  const scoreStr = score.toString();
  const digitHeight = 26;
  const spacing = 2;

  // Calculate total width accounting for narrow 1s
  let totalWidth = 0;
  for (let i = 0; i < scoreStr.length; i++) {
    totalWidth += parseInt(scoreStr[i]) === 1 ? 14 : 18;
    if (i < scoreStr.length - 1) totalWidth += spacing;
  }

  // If x is provided, align the right edge of the last digit to x
  let startX = typeof x === "number" ? x - totalWidth : (GAME_WIDTH - totalWidth) / 2;
  const startY = y ? y : 20;

  for (let i = 0; i < scoreStr.length; i++) {
    const scoreDigit = parseInt(scoreStr[i]);
    const digitWidth = scoreDigit === 1 ? 14 : 18;
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
      digitHeight
    );
    startX += digitWidth + spacing;
  }
}

function updateSparkles(centerX, centerY, radius) {
  if (sparkles.length === 0) {
    for (let i = 0; i < 1; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      sparkles.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        frame: Math.floor(Math.random() * sprites.sparkleFrames.length),
        frameDelay: 0,
        centerX,
        centerY,
        radius,
      });
    }
  }

  sparkles.forEach((sparkle) => {
    sparkle.frameDelay++;
    if (sparkle.frameDelay >= 6) {
      sparkle.frameDelay = 0;
      sparkle.frame++;
      if (sparkle.frame >= sprites.sparkleFrames.length) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * sparkle.radius;
        sparkle.x = sparkle.centerX + Math.cos(angle) * dist;
        sparkle.y = sparkle.centerY + Math.sin(angle) * dist;
        sparkle.frame = 0;
      }
    }

    const frame = sprites.sparkleFrames[sparkle.frame];
    const size = frame.sw * 2;
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

function drawScoreboard() {
  const score = gameState.score;
  const bestScore = gameState.bestScore;
  const scoreBoard = sprites.scoreBoard;
  const medals = sprites.medals;
  const scoreBoardWidth = 266;
  const scoreBoardHeight = 137;
  const scoreBoardX = (GAME_WIDTH - scoreBoardWidth) / 2;
  const scoreBoardY = (GAME_HEIGHT - scoreBoardHeight) / 2 - 5;
  let medal = null;
  const isNewScore = score > bestScore;
  ctx.drawImage(
    spritesheet,
    scoreBoard.sx,
    scoreBoard.sy,
    scoreBoard.sw,
    scoreBoard.sh,
    scoreBoardX,
    scoreBoardY,
    scoreBoardWidth,
    scoreBoardHeight
  );

  drawScore(score, scoreBoardX + scoreBoardWidth - 25, scoreBoardY + 40);
  drawScore(isNewScore ? score : bestScore, scoreBoardX + scoreBoardWidth - 25, scoreBoardY + 90);

  if (isNewScore) {
    const newLabel = sprites.messages.newScore;
    ctx.drawImage(
      spritesheet,
      newLabel.sx,
      newLabel.sy,
      newLabel.sw,
      newLabel.sh,
      scoreBoardX + scoreBoardWidth - 105,
      scoreBoardY + 68,
      36,
      18
    );
    localStorage.setItem("bestScore", score);
  }

  if (score >= 50) {
    medal = medals.platinum;
  } else if (score >= 30) {
    medal = medals.gold;
  } else if (score >= 20) {
    medal = medals.silver;
  } else if (score >= 10) {
    medal = medals.bronze;
  }

  if (medal) {
    const medalSize = 53;
    const medalX = scoreBoardX + 31;
    const medalY = scoreBoardY + scoreBoardHeight / 2 - (medalSize / 2 - 7);
    const sparkleRadius = medalSize / 2 - 5;
    const centerX = medalX + medalSize / 2;
    const centerY = medalY + medalSize / 2;

    ctx.drawImage(
      spritesheet,
      medal.sx,
      medal.sy,
      medal.sw,
      medal.sh,
      medalX,
      medalY,
      medalSize,
      medalSize
    );
    updateSparkles(centerX, centerY, sparkleRadius);
  } else {
    sparkles = [];
  }
}

function drawGameOverScreen() {
  const gameOverMsg = sprites.messages.gameOver;

  ctx.drawImage(
    spritesheet,
    gameOverMsg.sx,
    gameOverMsg.sy,
    gameOverMsg.sw,
    gameOverMsg.sh,
    (GAME_WIDTH - 220) / 2,
    110,
    220,
    48
  );
  drawScoreboard();
}
function drawMenu() {
  const fblogo = sprites.messages.logo;
  const bird = getBird();
  const startBtn = sprites.buttons.start;
  const scoreBtn = sprites.buttons.score;

  const btnY = GAME_HEIGHT - gameState.groundHeight - 50;
  const btnW = 95;
  const btnH = 35;
  const btnGap = 20;

  const logoY = bird ? bird.y - 10 : 110;
  ctx.drawImage(spritesheet, fblogo.sx, fblogo.sy, fblogo.sw, fblogo.sh, 30, logoY, 220, 58);

  ctx.drawImage(
    spritesheet,
    startBtn.sx,
    startBtn.sy,
    startBtn.sw,
    startBtn.sh,
    GAME_WIDTH / 2 - btnW - btnGap,
    btnY,
    btnW,
    btnH
  );

  ctx.drawImage(
    spritesheet,
    scoreBtn.sx,
    scoreBtn.sy,
    scoreBtn.sw,
    scoreBtn.sh,
    GAME_WIDTH / 2 + btnGap,
    btnY,
    btnW,
    btnH
  );
}

function drawUI() {
  if (gameState.isMenu()) {
    drawMenu();
  } else if (gameState.isPlaying()) {
    drawScore(gameState.score);
  } else if (gameState.isGameOver()) {
    drawGameOverScreen();
  }
}

export { initUI, drawUI };
