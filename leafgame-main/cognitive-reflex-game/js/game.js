import SoundManager from './sound.js';
import ScoreManager from './score.js';
import InputManager from './input.js';
import UIManager from './ui.js';
import Leaf from './leaf.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Instantiate managers (from global classes loaded via script tags)
    this.sound = new SoundManager();
    this.score = new ScoreManager();
    this.input = new InputManager();
    this.ui = new UIManager();
    
    // Game state variables
    this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameover', 'instructions'
    this.difficulty = 'medium';
    this.lives = 3;
    this.level = 1;
    this.correctInLevel = 0;
    
    this.leaves = [];
    this.lastTime = 0;
    this.spawnTimer = 0;
    
    // Difficulty configuration
    this.difficultyConfigs = {
      easy: {
        baseSpeed: 0.85,
        spawnInterval: 2200 // ms
      },
      medium: {
        baseSpeed: 1.15,
        spawnInterval: 1700
      },
      hard: {
        baseSpeed: 1.45,
        spawnInterval: 1200
      }
    };
    
    // Loaded configs (default medium)
    this.baseSpeed = this.difficultyConfigs.medium.baseSpeed;
    this.spawnInterval = this.difficultyConfigs.medium.spawnInterval;
    this.speedMultiplier = 1.0;
    
    // Bind game loop and listeners
    this.loop = this.loop.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.setupEventListeners();
    
    // Set initial canvas sizing
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  setupEventListeners() {
    // Menu buttons
    document.getElementById('start-btn').addEventListener('click', () => {
      this.sound.init(); // Initialize audio context on first click
      this.setDifficulty(this.difficulty);
      this.startGame();
    });
    
    document.getElementById('instructions-btn').addEventListener('click', () => {
      this.sound.init();
      this.state = 'instructions';
      this.ui.showScreen('instructions-screen');
    });
    
    document.getElementById('back-btn').addEventListener('click', () => {
      this.state = 'menu';
      this.ui.showScreen('start-screen');
    });
    
    document.getElementById('hud-pause-btn').addEventListener('click', () => {
      this.pauseGame();
    });
    
    document.getElementById('resume-btn').addEventListener('click', () => {
      this.resumeGame();
    });
    
    document.getElementById('pause-restart-btn').addEventListener('click', () => {
      this.startGame();
    });
    
    document.getElementById('gameover-restart-btn').addEventListener('click', () => {
      this.startGame();
    });
    
    document.getElementById('pause-menu-btn').addEventListener('click', () => {
      this.state = 'menu';
      this.ui.showScreen('start-screen');
    });
    
    document.getElementById('gameover-menu-btn').addEventListener('click', () => {
      this.state = 'menu';
      this.ui.showScreen('start-screen');
    });
    
    // Mute button
    document.getElementById('mute-btn').addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.ui.updateMuteButton(isMuted);
    });
    
    // Difficulty selector buttons
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        diffButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.difficulty = e.target.dataset.difficulty;
      });
    });
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // Update existing leaves with new canvas bounds
    this.leaves.forEach(leaf => {
      leaf.width = rect.width;
      leaf.height = rect.height;
    });
  }

  setDifficulty(level) {
    const config = this.difficultyConfigs[level];
    this.baseSpeed = config.baseSpeed;
    this.spawnInterval = config.spawnInterval;
  }

  startGame() {
    this.lives = 3;
    this.level = 1;
    this.correctInLevel = 0;
    this.speedMultiplier = 1.0;
    this.leaves = [];
    this.spawnTimer = 0;
    this.lastTime = performance.now();
    
    this.score.reset();
    this.setDifficulty(this.difficulty);
    
    this.state = 'playing';
    this.ui.showScreen(null); // Hide all overlays
    this.ui.updateHUD(
      this.score.score,
      this.score.highScore,
      this.level,
      this.score.getAccuracy(),
      this.score.combo,
      this.score.getMultiplier(),
      this.lives
    );
    
    // Start keyboard input listener
    this.input.start(this.handleInput);
    
    // Start loop
    requestAnimationFrame(this.loop);
  }

  pauseGame() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.pause();
    this.ui.showScreen('pause-screen');
  }

  resumeGame() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.lastTime = performance.now();
    this.input.resume();
    this.ui.showScreen(null);
    requestAnimationFrame(this.loop);
  }

  gameOver() {
    this.state = 'gameover';
    this.input.stop();
    this.ui.setPageBackground('bg-default');
    
    const isNewHigh = this.score.score > 0 && this.score.score >= this.score.highScore;
    this.ui.showGameOver(
      this.score.score,
      this.score.highScore,
      this.level,
      this.score.getAccuracy(),
      this.score.maxCombo,
      isNewHigh
    );
  }

  handleInput(pressedDirection) {
    if (this.state !== 'playing') return;
    
    // Find the oldest active leaf that is unprocessed
    const targetIndex = this.leaves.findIndex(leaf => !leaf.processed);
    if (targetIndex === -1) return;
    
    const targetLeaf = this.leaves[targetIndex];
    targetLeaf.processed = true;
    
    // Determine the expected answer based on rules
    let correctDirection = '';
    if (targetLeaf.color === 'orange') {
      // Orange: press movement direction
      correctDirection = targetLeaf.direction;
    } else {
      // Green: press apex pointing direction
      correctDirection = targetLeaf.apex;
    }
    
    if (pressedDirection === correctDirection) {
      // Correct input
      const result = this.score.recordCorrect();
      this.sound.playCorrect();
      this.ui.triggerFlash('correct');
      if (result.combo > 0) {
        this.ui.bumpCombo();
      }
      
      // Level progression
      this.correctInLevel++;
      if (this.correctInLevel >= 15) {
        this.levelUp();
      }
    } else {
      // Incorrect input
      this.score.recordIncorrect();
      this.sound.playIncorrect();
      this.ui.triggerFlash('incorrect');
      this.lives--;
    }
    
    // Clean up processed leaf quickly by removing it
    this.leaves.splice(targetIndex, 1);
    
    // Update HUD
    this.ui.updateHUD(
      this.score.score,
      this.score.highScore,
      this.level,
      this.score.getAccuracy(),
      this.score.combo,
      this.score.getMultiplier(),
      this.lives
    );
    
    // Check game over
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  levelUp() {
    this.level++;
    this.correctInLevel = 0;
    
    // Speed increases by 10%
    this.speedMultiplier *= 1.10;
    
    // Spawn rate increases slightly (interval decreases by 8%, cap at 600ms)
    this.spawnInterval = Math.max(600, this.spawnInterval * 0.92);
  }

  loop(time) {
    if (this.state !== 'playing') return;
    
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    this.update(deltaTime);
    this.draw();
    
    requestAnimationFrame(this.loop);
  }

  update(deltaTime) {
    // 1. Spawning logic
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      
      if (this.leaves.length < 4) {
        this.spawnLeaf();
        
        // After score 30, occasionally spawn a second leaf simultaneously (up to screen limit 4)
        if (this.score.score > 30 && this.leaves.length < 3 && Math.random() < 0.35) {
          this.spawnLeaf();
        }
      }
    }
    
    // 2. Update leaves and check missed bounds
    let livesChanged = false;
    
    for (let i = this.leaves.length - 1; i >= 0; i--) {
      const leaf = this.leaves[i];
      leaf.update();
      
      // If leaf goes off-screen without being responded to, it's a miss
      if (leaf.isOutOfBounds()) {
        if (!leaf.processed) {
          leaf.processed = true;
          this.score.recordMiss();
          this.sound.playIncorrect();
          this.ui.triggerFlash('incorrect');
          this.lives--;
          livesChanged = true;
        }
        // Remove from list
        this.leaves.splice(i, 1);
      }
    }
    
    if (livesChanged) {
      this.ui.updateHUD(
        this.score.score,
        this.score.highScore,
        this.level,
        this.score.getAccuracy(),
        this.score.combo,
        this.score.getMultiplier(),
        this.lives
      );
      
      if (this.lives <= 0) {
        this.gameOver();
      }
    }
    
    // 3. Dynamic background color updates based on active target leaf
    const targetLeaf = this.leaves.find(l => !l.processed);
    if (targetLeaf) {
      if (targetLeaf.color === 'orange') {
        this.ui.setPageBackground('bg-orange');
      } else {
        this.ui.setPageBackground('bg-green');
      }
    } else {
      this.ui.setPageBackground('bg-default');
    }
  }

  spawnLeaf() {
    const finalSpeedMultiplier = this.baseSpeed * this.speedMultiplier;
    const leaf = new Leaf(this.canvas.width, this.canvas.height, finalSpeedMultiplier);
    this.leaves.push(leaf);
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw active leaves
    this.leaves.forEach(leaf => leaf.draw(this.ctx));
  }
}
export default Game;
