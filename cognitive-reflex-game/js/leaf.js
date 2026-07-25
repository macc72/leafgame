class Leaf {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 1.0) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    
    // Randomize leaf properties
    this.color = Math.random() < 0.5 ? 'orange' : 'green';
    
    const directions = ['up', 'down', 'left', 'right'];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
    
    // Apex orientation is independent of movement direction
    this.apex = directions[Math.floor(Math.random() * directions.length)];
    
    this.size = 55;
    this.processed = false;
    
    // Set base speed depending on direction
    const baseSpeed = 2.5 * speedMultiplier;
    this.speed = baseSpeed;
    
    // Set spawn positions and velocities
    const offset = this.size + 10;
    
    switch (this.direction) {
      case 'up':
        this.x = this.getRandomRange(this.width * 0.2, this.width * 0.8);
        this.y = this.height + offset;
        this.vx = 0;
        this.vy = -this.speed;
        break;
      case 'down':
        this.x = this.getRandomRange(this.width * 0.2, this.width * 0.8);
        this.y = -offset;
        this.vx = 0;
        this.vy = this.speed;
        break;
      case 'left':
        this.x = this.width + offset;
        this.y = this.getRandomRange(this.height * 0.2, this.height * 0.8);
        this.vx = -this.speed;
        this.vy = 0;
        break;
      case 'right':
        this.x = -offset;
        this.y = this.getRandomRange(this.height * 0.2, this.height * 0.8);
        this.vx = this.speed;
        this.vy = 0;
        break;
    }
    
    // Sway variables
    this.swayTime = Math.random() * 100;
    this.swaySpeed = 0.05 + Math.random() * 0.05;
    this.swayRange = 15 + Math.random() * 10;
  }

  getRandomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  update() {
    // Translate position
    this.x += this.vx;
    this.y += this.vy;
    
    // Update sway phase
    this.swayTime += this.swaySpeed;
  }

  isOutOfBounds() {
    const offset = this.size + 20;
    switch (this.direction) {
      case 'up':
        return this.y < -offset;
      case 'down':
        return this.y > this.height + offset;
      case 'left':
        return this.x < -offset;
      case 'right':
        return this.x > this.width + offset;
    }
    return false;
  }

  // Draw the leaf on the canvas context
  draw(ctx) {
    ctx.save();
    
    // Calculate sway offsets (perpendicular to direction)
    let drawX = this.x;
    let drawY = this.y;
    const swayOffset = Math.sin(this.swayTime) * this.swayRange;
    
    if (this.direction === 'up' || this.direction === 'down') {
      drawX += swayOffset;
    } else {
      drawY += swayOffset;
    }
    
    ctx.translate(drawX, drawY);
    
    // Rotate canvas according to leaf's apex orientation
    // Default drawing points straight UP
    let rotation = 0;
    switch (this.apex) {
      case 'up':
        rotation = 0;
        break;
      case 'right':
        rotation = Math.PI / 2;
        break;
      case 'down':
        rotation = Math.PI;
        break;
      case 'left':
        rotation = -Math.PI / 2;
        break;
    }
    ctx.rotate(rotation);
    
    // Styles
    const mainColor = this.color === 'orange' ? '#ff7b00' : '#00e676';
    const highlightColor = this.color === 'orange' ? '#ffb973' : '#a2ffb6';
    const strokeColor = '#1e1e1e';
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = mainColor;
    
    // Draw Leaf Body (pointed tip at the top, rounded bottom)
    ctx.beginPath();
    // Start at stem bottom
    ctx.moveTo(0, this.size * 0.45);
    
    // Curve left side up to the shoulder
    ctx.quadraticCurveTo(-this.size * 0.4, this.size * 0.1, -this.size * 0.2, -this.size * 0.15);
    
    // Straight line to the sharp apex tip
    ctx.lineTo(0, -this.size * 0.5);
    
    // Straight line from tip to right shoulder
    ctx.lineTo(this.size * 0.2, -this.size * 0.15);
    
    // Curve right side back to stem bottom
    ctx.quadraticCurveTo(this.size * 0.4, this.size * 0.1, 0, this.size * 0.45);
    
    ctx.closePath();
    ctx.fillStyle = mainColor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    
    // Draw highlight on the triangular apex to emphasize orientation
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.2, -this.size * 0.15);
    ctx.lineTo(0, -this.size * 0.5);
    ctx.lineTo(this.size * 0.2, -this.size * 0.15);
    ctx.closePath();
    ctx.fillStyle = highlightColor;
    ctx.fill();
    ctx.stroke();
    
    // Center vein
    ctx.shadowBlur = 0; // disable shadow for clean lines
    ctx.beginPath();
    ctx.moveTo(0, this.size * 0.4);
    ctx.lineTo(0, -this.size * 0.15); // Connects to the base of the highlight triangle
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Optional tiny stem
    ctx.beginPath();
    ctx.moveTo(0, this.size * 0.45);
    ctx.lineTo(0, this.size * 0.55);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    
    ctx.restore();
  }
}
window.Leaf = Leaf;
