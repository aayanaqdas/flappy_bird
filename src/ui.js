import { gameState } from "./gameStates.js";

const GAME_WIDTH = gameState.GAME_WIDTH;
const GAME_HEIGHT = gameState.GAME_HEIGHT;

let ctx;
let spritesheet;
let sprites;

function initUI(spriteMap) {
  ctx = gameState.ctx;
  spritesheet = gameState.spritesheet;
  sprites = {
    digits: spriteMap.digits,
    messages: spriteMap.messages,
    scoreBoard: spriteMap.scoreBoard,
    medals: spriteMap.medals,
  };
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

export { initUI, drawGameOverScreen, drawScore };
