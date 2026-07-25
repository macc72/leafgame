class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cognitive_leaf_high_score')) || 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctHits = 0;
    this.incorrectHits = 0;
    this.missedHits = 0;
    this.totalAttempts = 0;
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctHits = 0;
    this.incorrectHits = 0;
    this.missedHits = 0;
    this.totalAttempts = 0;
  }

  getAccuracy() {
    if (this.totalAttempts === 0) return 100;
    return Math.round((this.correctHits / this.totalAttempts) * 100);
  }

  getMultiplier() {
    // 2x score multiplier after 10 consecutive correct hits
    return this.combo >= 10 ? 2 : 1;
  }

  recordCorrect() {
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    
    this.correctHits++;
    this.totalAttempts++;
    
    const points = 1 * this.getMultiplier();
    this.score += points;
    
    let newHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('cognitive_leaf_high_score', this.highScore);
      newHighScore = true;
    }
    
    return { points, newHighScore, combo: this.combo, multiplier: this.getMultiplier() };
  }

  recordIncorrect() {
    this.combo = 0;
    this.incorrectHits++;
    this.totalAttempts++;
    return { combo: this.combo };
  }

  recordMiss() {
    this.combo = 0;
    this.missedHits++;
    this.totalAttempts++;
    return { combo: this.combo };
  }
}
window.ScoreManager = ScoreManager;
