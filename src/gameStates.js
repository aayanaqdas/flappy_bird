import { playSound } from "./audio.js";

export const GameStates = {
  MENU: "MENU",
  READY: "READY",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
};

class GameState {
  constructor() {
    this.currentState = GameStates.MENU;
    this.previousState = null;

    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem("bestScore")) || 0;

    this.GAME_WIDTH = 320;
    this.GAME_HEIGHT = 512;
    this.groundHeight = 150;
    this.groundY = 70;
    this.groundX = 0;
    this.gameSpeed = 2;
    this.flashAlpha = 0;
    this.transitionAlpha = 0;
    this.fadeDirection = 0;
    this.targetState = null;

    this.canvas = null;
    this.ctx = null;
    this.spritesheet = null;
  }

  init(canvas, ctx, spritesheet) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spritesheet = spritesheet;
  }

  isMenu() {
    return this.currentState === GameStates.MENU;
  }

  isReady() {
    return this.currentState === GameStates.READY;
  }

  isPlaying() {
    return this.currentState === GameStates.PLAYING;
  }

  isPaused() {
    return this.currentState === GameStates.PAUSED;
  }

  isGameOver() {
    return this.currentState === GameStates.GAME_OVER;
  }

  wasPausedFromReady() {
    return this.isPaused() && this.previousState === GameStates.READY;
  }

  setState(newState) {
    this.previousState = this.currentState;
    this.currentState = newState;
  }

  menu() {
    this.fadeDirection = 1;
    this.targetState = GameStates.MENU;
  }

  startGame() {
    playSound("flap");
    this.setState(GameStates.PLAYING);
  }

  readyGame() {
    this.resetScore();
    this.fadeDirection = 1;
    this.targetState = GameStates.READY;
  }

  pauseGame() {
    playSound("swoosh");
    this.setState(GameStates.PAUSED);
  }

  resumeGame() {
    playSound("swoosh");
    if (this.previousState === GameStates.READY) {
      this.setState(GameStates.READY);
    } else {
      this.setState(GameStates.PLAYING);
    }
  }

  gameOver() {
    this.flashAlpha = 1;
    playSound("swoosh");
    this.setState(GameStates.GAME_OVER);
  }

  incrementScore() {
    this.score++;
    playSound("score");
  }

  resetScore() {
    this.score = 0;
  }
  reset() {
    this.menu();
  }

  // Ground animation
  updateGroundX() {
    if (!this.isPaused() && !this.isGameOver()) {
      this.groundX -= this.gameSpeed;
      if (this.groundX <= -this.GAME_WIDTH) {
        this.groundX += this.GAME_WIDTH;
      }
    }
  }

  drawFlash() {
    if (this.flashAlpha > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);

      this.flashAlpha -= 0.1;

      if (this.flashAlpha < 0) this.flashAlpha = 0;
    }
  }

  updateTransition() {
    if (this.fadeDirection === 0) return;
    this.transitionAlpha += this.fadeDirection * 0.1;

    if (this.transitionAlpha >= 1) {
      playSound("swoosh");
      this.transitionAlpha = 1;
      this.fadeDirection = -1;
      this.setState(this.targetState);
    }

    if (this.transitionAlpha <= 0 && this.fadeDirection === -1) {
      this.transitionAlpha = 0;
      this.fadeDirection = 0;
    }
  }

  drawTransition() {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
    this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
  }
}

export const gameState = new GameState();
