class MusicManager {
  private audio: HTMLAudioElement | null = null;
  private enabled: boolean = true;

  constructor() {
    // Create placeholder background music
    // In production, replace with actual music file
    this.audio = new Audio("/sounds/move.mp3"); // Placeholder - use actual background music
    this.audio.loop = true;
    this.audio.volume = 0.1;
  }

  play() {
    if (this.audio && this.enabled) {
      this.audio.play().catch(() => {});
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.play();
    } else {
      this.pause();
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export const musicManager = new MusicManager();
