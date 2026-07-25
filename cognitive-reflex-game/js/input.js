class InputManager {
  constructor() {
    this.onInputCallback = null;
    this.active = false;
    
    // Bind event handler
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  start(callback) {
    this.onInputCallback = callback;
    this.active = true;
    window.addEventListener('keydown', this.handleKeyDown);
  }

  stop() {
    this.active = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    this.onInputCallback = null;
  }

  pause() {
    this.active = false;
  }

  resume() {
    this.active = true;
  }

  handleKeyDown(event) {
    if (!this.active || !this.onInputCallback) return;

    let direction = null;
    
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'right';
        break;
      default:
        return; // Let other keys behave normally
    }

    // Prevent default scroll behavior of arrow keys
    event.preventDefault();
    
    // Fire callback with pressed direction
    this.onInputCallback(direction);
  }
}
window.InputManager = InputManager;
