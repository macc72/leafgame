class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientSource = null;
    this.ambientFilter = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.masterVolume = null;
    this.ambientVolume = null;
  }

  init() {
    if (this.ctx) return;
    
    // Create Audio Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master volume node
    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    this.masterVolume.connect(this.ctx.destination);
    
    // Setup ambient loop (wind & drone)
    this.setupAmbience();
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.setTargetAtTime(mute ? 0 : 1, this.ctx.currentTime, 0.1);
    }
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  playCorrect() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    
    // Quick soft chime
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08); // A5
    
    gainNode.gain.setValueAtTime(0.15, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterVolume);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playIncorrect() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    
    // Low error buzz
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, t); // C3
    osc.frequency.linearRampToValueAtTime(80, t + 0.18);
    
    gainNode.gain.setValueAtTime(0.3, t);
    gainNode.gain.linearRampToValueAtTime(0.001, t + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterVolume);
    
    osc.start(t);
    osc.stop(t + 0.2);
  }

  setupAmbience() {
    const t = this.ctx.currentTime;
    
    // 1. Wind noise generator
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    // Bandpass filter for wind swoosh
    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = 'bandpass';
    this.ambientFilter.frequency.setValueAtTime(300, t);
    this.ambientFilter.Q.setValueAtTime(1.5, t);
    
    // LFO to modulate wind frequency (simulate wind gusting)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, t); // very slow cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(150, t); // frequency modulation range
    
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientFilter.frequency);
    
    // 2. Low Drone Pad
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    
    this.droneOsc1.type = 'triangle';
    this.droneOsc1.frequency.setValueAtTime(110, t); // A2
    
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(110.5, t); // Detuned A2
    
    // Ambient Volume Gain Node
    this.ambientVolume = this.ctx.createGain();
    this.ambientVolume.gain.setValueAtTime(0.04, t); // Soft background level
    
    // Connections
    noiseSource.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientVolume);
    
    this.droneOsc1.connect(this.ambientVolume);
    this.droneOsc2.connect(this.ambientVolume);
    
    this.ambientVolume.connect(this.masterVolume);
    
    // Start components
    noiseSource.start(t);
    lfo.start(t);
    this.droneOsc1.start(t);
    this.droneOsc2.start(t);
    
    this.ambientSource = noiseSource;
  }
}
export default SoundManager;
