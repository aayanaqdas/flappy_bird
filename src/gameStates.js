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

    this.GAME_WIDTH = 330;
    this.GAME_HEIGHT = 480;
    this.groundHeight = 150;
    this.groundY = 70;

    this.gameSpeed = 2;
    this.groundX = 0;

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
    playSound("swoosh");
    this.setState(GameStates.MENU);
  }

  startGame() {
    playSound("flap");
    this.setState(GameStates.PLAYING);
  }

  readyGame() {
    playSound("swoosh");
    this.setState(GameStates.READY);
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
    playSound("swoosh");
    this.setState(GameStates.GAME_OVER);
  }

  incrementScore() {
    playSound("score");
    this.score++;
  }

  resetScore() {
    this.score = 0;
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

  reset() {
    this.menu();
    this.score = 0;
    this.groundX = 0;
  }
}

export const gameState = new GameState();
