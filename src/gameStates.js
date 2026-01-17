export const GameStates = {
  MENU: "MENU",
  READY: "READY",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
};

class GameState {
  constructor() {
    this.currentState = GameStates.PLAYING;

    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem("bestScore")) || 0;

    this.GAME_WIDTH = 330;
    this.GAME_HEIGHT = 480;
    this.groundHeight = 112;

    // Game mechanics
    this.gameSpeed = 2;
    this.groundX = 0;

    this.canvas = null;
    this.ctx = null;
    this.spritesheet = null;
  }

  // Initialize context
  init(ctx, spritesheet) {
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

  setState(newState) {
    this.currentState = newState;
  }

  startGame() {
    this.setState(GameStates.PLAYING);
  }

  pauseGame() {
    this.setState(GameStates.PAUSED);
  }

  resumeGame() {
    this.setState(GameStates.PLAYING);
  }

  gameOver() {
    this.setState(GameStates.GAME_OVER);
  }

  incrementScore() {
    this.score++;
  }

  resetScore() {
    this.score = 0;
  }

  // Ground animation
  updateGroundX() {
    if (this.isPlaying()) {
      this.groundX -= this.gameSpeed;
      if (this.groundX <= -this.GAME_WIDTH) {
        this.groundX += this.GAME_WIDTH;
      }
    }
  }

  reset() {
    this.score = 0;
    this.groundX = 0;
    this.setState(GameStates.READY);
  }
}

export const gameState = new GameState();
