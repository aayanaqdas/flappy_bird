export class Animation {
  constructor(delay, duration) {
    this.delay = delay;
    this.duration = duration;
    this.startTime = null;
  }

  start() {
    this.startTime = Date.now();
  }

  getProgress() {
    if (!this.startTime) return null;
    
    const elapsed = Date.now() - this.startTime;
    if (elapsed < this.delay) return null;
    
    const animElapsed = elapsed - this.delay;
    if (animElapsed >= this.duration) return 1;
    
    return animElapsed / this.duration;
  }

  isComplete() {
    return this.getProgress() === 1;
  }
}