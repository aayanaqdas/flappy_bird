import { gameState } from "./gameStates.js";
import { unlockAudio } from "./audio.js";

const GAME_WIDTH = gameState.GAME_WIDTH;
const GAME_HEIGHT = gameState.GAME_HEIGHT;

let audioUnlocked = false;

const BUTTON_CONFIG = {
  width: 95,
  height: 35,
  gap: 20,
  pauseSize: 35,
  pauseMargin: 20,
};

const createButton = (onClick, config = {}) => ({
  x: 0,
  y: 0,
  baseY: 0,
  w: config.width || BUTTON_CONFIG.width,
  h: config.height || BUTTON_CONFIG.height,
  pressed: false,
  onClick,
});

const BUTTONS = {
  start: createButton(() => {
    gameState.readyGame();
  }),
  score: createButton(() => {
    if (confirm(`Reset your best score (${gameState.bestScore})?`)) {
      gameState.bestScore = 0;
      localStorage.setItem("bestScore", "0");
      gameState.reset();
    }
  }),
  ok: createButton(() => {
    gameState.reset();
  }),
  share: createButton(async () => {
    if (!navigator.share) {
      alert("Web Share not supported (check HTTPS)");
      return;
    }

    try {
      await navigator.share({
        title: "Flappy Bird Score",
        text: `I scored ${gameState.score} points in this Flappy Bird remake! Can you beat it?`,
        url: window.location.href,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.log("Share failed:", err.name);
      }
    }
  }),
  pause: createButton(
    () => {
      gameState.pauseGame();
    },
    { width: BUTTON_CONFIG.pauseSize, height: BUTTON_CONFIG.pauseSize },
  ),
  resume: createButton(
    () => {
      gameState.resumeGame();
    },
    { width: BUTTON_CONFIG.pauseSize, height: BUTTON_CONFIG.pauseSize },
  ),
};

function setButtonPosition(button, x, y) {
  button.x = x;
  button.y = y;
  button.baseY = y;
}

setButtonPosition(BUTTONS.pause, BUTTON_CONFIG.pauseMargin, BUTTON_CONFIG.pauseMargin);
setButtonPosition(BUTTONS.resume, BUTTON_CONFIG.pauseMargin, BUTTON_CONFIG.pauseMargin);

function positionButtons() {
  const btnY = GAME_HEIGHT - gameState.groundY - 50;
  const { gap, width } = BUTTON_CONFIG;
  const centerX = GAME_WIDTH / 2;

  setButtonPosition(BUTTONS.start, centerX - width - gap, btnY);
  setButtonPosition(BUTTONS.score, centerX + gap, btnY);
  setButtonPosition(BUTTONS.ok, centerX - width - gap, btnY);
  setButtonPosition(BUTTONS.share, centerX + gap, btnY);
}

function isPointInRect(clickX, clickY, x, y, width, height) {
  return clickX >= x && clickX <= x + width && clickY >= y && clickY <= y + height;
}

function isButtonClicked(button, clickX, clickY) {
  return isPointInRect(clickX, clickY, button.x, button.y, button.w, button.h);
}

function pressButton(button) {
  button.pressed = true;
  button.y = button.baseY + 2;

  setTimeout(() => {
    button.pressed = false;
    button.y = button.baseY;
  }, 100);
}

const STATE_CLICK_HANDLERS = {
  MENU: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.start, clickX, clickY)) {
      pressButton(BUTTONS.start);
      BUTTONS.start.onClick();
    } else if (isButtonClicked(BUTTONS.score, clickX, clickY)) {
      pressButton(BUTTONS.score);
      BUTTONS.score.onClick();
    }
  },
  READY: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.pause, clickX, clickY)) {
      pressButton(BUTTONS.pause);
      BUTTONS.pause.onClick();
    } else {
      gameState.startGame();
    }
  },
  PLAYING: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.pause, clickX, clickY)) {
      pressButton(BUTTONS.pause);
      BUTTONS.pause.onClick();
    }
  },
  PAUSED: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.resume, clickX, clickY)) {
      pressButton(BUTTONS.resume);
      BUTTONS.resume.onClick();
    }
  },
  GAME_OVER: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.ok, clickX, clickY)) {
      pressButton(BUTTONS.ok);
      BUTTONS.ok.onClick();
    } else if (isButtonClicked(BUTTONS.share, clickX, clickY)) {
      pressButton(BUTTONS.share);
      BUTTONS.share.onClick();
    }
  },
};

function handleCanvasClick(e) {
  if (!audioUnlocked) {
    unlockAudio();
    audioUnlocked = true;
  }
  const rect = gameState.canvas.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * GAME_WIDTH;
  const clickY = ((e.clientY - rect.top) / rect.height) * GAME_HEIGHT;

  const handler = STATE_CLICK_HANDLERS[gameState.currentState];
  if (handler) {
    handler(clickX, clickY);
  }
}

function initUIEvents() {
  positionButtons();
  gameState.canvas.addEventListener("click", handleCanvasClick);
}

export { initUIEvents, BUTTONS };
