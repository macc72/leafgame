class UIManager {
  constructor() {
    // HUD Elements
    this.scoreVal = document.getElementById('score-val');
    this.highScoreVal = document.getElementById('high-score-val');
    this.levelVal = document.getElementById('level-val');
    this.accuracyVal = document.getElementById('accuracy-val');
    this.comboVal = document.getElementById('combo-val');
    this.comboContainer = document.getElementById('hud-combo');
    this.livesContainer = document.getElementById('hud-lives-container');
    
    // Screens
    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.instructionsScreen = document.getElementById('instructions-screen');
    
    // Stats in Game Over Screen
    this.finalScore = document.getElementById('final-score');
    this.finalHighScore = document.getElementById('final-high-score');
    this.finalLevel = document.getElementById('final-level');
    this.finalAccuracy = document.getElementById('final-accuracy');
    this.finalCombo = document.getElementById('final-max-combo');
    this.highScoreAlert = document.getElementById('high-score-alert');
    
    // Flash Overlay
    this.flashOverlay = document.getElementById('flash-overlay');
    
    // Mute Icon
    this.muteBtn = document.getElementById('mute-btn');
    
    // Initialize diagrams
    this.drawInstructionsDiagrams();
  }

  updateHUD(score, highScore, level, accuracy, combo, multiplier, lives) {
    if (this.scoreVal) this.scoreVal.textContent = score;
    if (this.highScoreVal) this.highScoreVal.textContent = highScore;
    if (this.levelVal) this.levelVal.textContent = level;
    if (this.accuracyVal) this.accuracyVal.textContent = `${accuracy}%`;
    
    // Combo multiplier logic
    if (this.comboVal && this.comboContainer) {
      this.comboVal.textContent = combo;
      if (combo >= 10) {
        this.comboContainer.style.display = 'block';
        this.comboContainer.innerHTML = `COMBO: <span id="combo-val">${combo}</span> (${multiplier}x)`;
      } else if (combo > 0) {
        this.comboContainer.style.display = 'block';
        this.comboContainer.innerHTML = `COMBO: <span id="combo-val">${combo}</span>`;
      } else {
        this.comboContainer.style.display = 'none';
      }
    }
    
    // Update Hearts
    if (this.livesContainer) {
      this.livesContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const heartSpan = document.createElement('span');
        heartSpan.className = 'heart';
        heartSpan.textContent = '♥';
        if (i >= lives) {
          heartSpan.classList.add('lost');
        }
        this.livesContainer.appendChild(heartSpan);
      }
    }
  }

  bumpCombo() {
    if (this.comboContainer) {
      this.comboContainer.classList.remove('bump');
      // trigger reflow
      void this.comboContainer.offsetWidth;
      this.comboContainer.classList.add('bump');
    }
  }

  showScreen(screenId) {
    // Hide all screens
    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.instructionsScreen.classList.add('hidden');
    
    // Show selected screen
    if (screenId) {
      const activeScreen = document.getElementById(screenId);
      if (activeScreen) {
        activeScreen.classList.remove('hidden');
      }
    }
  }

  showGameOver(score, highScore, level, accuracy, maxCombo, isNewHighScore) {
    if (this.finalScore) this.finalScore.textContent = score;
    if (this.finalHighScore) this.finalHighScore.textContent = highScore;
    if (this.finalLevel) this.finalLevel.textContent = level;
    if (this.finalAccuracy) this.finalAccuracy.textContent = `${accuracy}%`;
    if (this.finalCombo) this.finalCombo.textContent = maxCombo;
    
    if (this.highScoreAlert) {
      this.highScoreAlert.style.display = isNewHighScore ? 'block' : 'none';
    }
    
    this.showScreen('gameover-screen');
  }

  triggerFlash(type) {
    if (!this.flashOverlay) return;
    
    this.flashOverlay.className = '';
    void this.flashOverlay.offsetWidth; // Reflow
    
    if (type === 'correct') {
      this.flashOverlay.classList.add('correct');
    } else if (type === 'incorrect') {
      this.flashOverlay.classList.add('incorrect');
    }
    
    // Fade out after 100ms
    setTimeout(() => {
      this.flashOverlay.className = '';
    }, 100);
  }

  updateMuteButton(isMuted) {
    if (this.muteBtn) {
      this.muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
    }
  }

  // Draw rules visual aids
  drawInstructionsDiagrams() {
    const canvasOrange = document.getElementById('diagram-orange');
    const canvasGreen = document.getElementById('diagram-green');
    
    if (canvasOrange) {
      const ctx = canvasOrange.getContext('2d');
      canvasOrange.width = 100;
      canvasOrange.height = 100;
      this.renderDiagram(ctx, 'orange', 'left', 'up', '←');
    }
    
    if (canvasGreen) {
      const ctx = canvasGreen.getContext('2d');
      canvasGreen.width = 100;
      canvasGreen.height = 100;
      this.renderDiagram(ctx, 'green', 'left', 'up', '↑');
    }
  }

  renderDiagram(ctx, color, direction, apex, arrowText) {
    ctx.clearRect(0, 0, 100, 100);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 100, 100);
    
    // Draw a simplified leaf inside the diagram
    ctx.save();
    ctx.translate(50, 40);
    
    // Rotate for apex
    let rotation = 0;
    if (apex === 'up') rotation = 0;
    else if (apex === 'right') rotation = Math.PI / 2;
    else if (apex === 'down') rotation = Math.PI;
    else if (apex === 'left') rotation = -Math.PI / 2;
    ctx.rotate(rotation);
    
    // Draw Leaf Body
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(-15, 5, -8, -8);
    ctx.lineTo(0, -25);
    ctx.lineTo(8, -8);
    ctx.quadraticCurveTo(15, 5, 0, 20);
    ctx.closePath();
    
    ctx.fillStyle = color === 'orange' ? '#ff7b00' : '#00e676';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#111';
    ctx.stroke();
    
    // Draw apex highlight
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(0, -25);
    ctx.lineTo(8, -8);
    ctx.closePath();
    ctx.fillStyle = color === 'orange' ? '#ffb973' : '#a2ffb6';
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    
    // Draw motion arrow representation
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (direction === 'left') {
      ctx.moveTo(85, 40);
      ctx.lineTo(70, 40);
      ctx.lineTo(75, 35);
      ctx.moveTo(70, 40);
      ctx.lineTo(75, 45);
    }
    ctx.stroke();
    
    // Draw keycap
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(35, 70, 30, 22, 4);
    ctx.fill();
    ctx.stroke();
    
    // Draw Key Label text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(arrowText, 50, 81);
  }

  setPageBackground(colorClass) {
    document.body.className = '';
    document.body.classList.add(colorClass);
  }
}
window.UIManager = UIManager;
