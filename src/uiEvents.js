import { gameState } from "./gameStates.js";

const GAME_WIDTH = gameState.GAME_WIDTH;
const GAME_HEIGHT = gameState.GAME_HEIGHT;

const BUTTON_CONFIG = {
  width: 95,
  height: 35,
  gap: 30,
  pauseSize: 35,
  pauseMargin: 20,
};

const createButton = (onClick, config = {}) => ({
  x: 0,
  y: 0,
  w: config.width || BUTTON_CONFIG.width,
  h: config.height || BUTTON_CONFIG.height,
  onClick,
});

const BUTTONS = {
  start: createButton(() => {
    console.log("Start button clicked!");
    gameState.readyGame();
  }),
  score: createButton(() => {
    console.log("Score button clicked!");
  }),
  ok: createButton(() => {
    console.log("OK button clicked!");
    gameState.reset();
  }),
  share: createButton(() => {
    console.log("Share button clicked!");
  }),
  pause: createButton(
    () => {
      console.log("Pause button clicked!");
      gameState.pauseGame();
    },
    { width: BUTTON_CONFIG.pauseSize, height: BUTTON_CONFIG.pauseSize }
  ),
  resume: createButton(
    () => {
      console.log("Resume button clicked!");
      gameState.resumeGame();
    },
    { width: BUTTON_CONFIG.pauseSize, height: BUTTON_CONFIG.pauseSize }
  ),
};


BUTTONS.pause.x = BUTTON_CONFIG.pauseMargin;
BUTTONS.pause.y = BUTTON_CONFIG.pauseMargin;
BUTTONS.resume.x = BUTTON_CONFIG.pauseMargin;
BUTTONS.resume.y = BUTTON_CONFIG.pauseMargin;

function positionButtons() {
  const btnY = GAME_HEIGHT - gameState.groundY - 50;
  const { gap, width } = BUTTON_CONFIG;

  BUTTONS.start.x = GAME_WIDTH / 2 - width - gap;
  BUTTONS.start.y = btnY;
  BUTTONS.score.x = GAME_WIDTH / 2 + gap;
  BUTTONS.score.y = btnY;

  BUTTONS.ok.x = GAME_WIDTH / 2 - width - gap;
  BUTTONS.ok.y = btnY;
  BUTTONS.share.x = GAME_WIDTH / 2 + gap;
  BUTTONS.share.y = btnY;
}

function isPointInRect(clickX, clickY, x, y, width, height) {
  return clickX >= x && clickX <= x + width && clickY >= y && clickY <= y + height;
}

function isButtonClicked(button, clickX, clickY) {
  return isPointInRect(clickX, clickY, button.x, button.y, button.w, button.h);
}

const STATE_CLICK_HANDLERS = {
  MENU: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.start, clickX, clickY)) {
      BUTTONS.start.onClick();
    } else if (isButtonClicked(BUTTONS.score, clickX, clickY)) {
      BUTTONS.score.onClick();
    }
  },
  READY: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.pause, clickX, clickY)) {
      BUTTONS.pause.onClick();
    } else {
      gameState.startGame();
    }
  },
  PLAYING: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.pause, clickX, clickY)) {
      BUTTONS.pause.onClick();
    }
  },
  PAUSED: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.resume, clickX, clickY)) {
      BUTTONS.resume.onClick();
    }
  },
  GAME_OVER: (clickX, clickY) => {
    if (isButtonClicked(BUTTONS.ok, clickX, clickY)) {
      BUTTONS.ok.onClick();
    } else if (isButtonClicked(BUTTONS.share, clickX, clickY)) {
      BUTTONS.share.onClick();
    }
  },
};

function handleCanvasClick(e) {
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