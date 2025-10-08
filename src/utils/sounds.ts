class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled: boolean = true;

  constructor() {
    this.loadSounds();
  }

  private loadSounds() {
    this.sounds.move = new Audio("/sounds/move.mp3");
    this.sounds.capture = new Audio("/sounds/capture.mp3");
    this.sounds.check = new Audio("/sounds/check.mp3");
  }

  playMove() {
    if (this.enabled) {
      this.sounds.move?.play().catch(() => {});
    }
  }

  playCapture() {
    if (this.enabled) {
      this.sounds.capture?.play().catch(() => {});
    }
  }

  playCheck() {
    if (this.enabled) {
      this.sounds.check?.play().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();