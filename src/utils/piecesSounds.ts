import { ChessPiece } from "@/store/chessStore";

class PieceSoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled: boolean = true;

  constructor() {
    this.loadSounds();
  }

  private loadSounds() {
    // For now, use the same sounds - can be replaced with piece-specific sounds
    this.sounds.pawn = new Audio("/sounds/move.mp3");
    this.sounds.rook = new Audio("/sounds/move.mp3");
    this.sounds.knight = new Audio("/sounds/move.mp3");
    this.sounds.bishop = new Audio("/sounds/move.mp3");
    this.sounds.queen = new Audio("/sounds/move.mp3");
    this.sounds.king = new Audio("/sounds/move.mp3");
    
    // Set volumes slightly different for variety
    this.sounds.pawn.volume = 0.5;
    this.sounds.rook.volume = 0.7;
    this.sounds.knight.volume = 0.6;
    this.sounds.bishop.volume = 0.6;
    this.sounds.queen.volume = 0.8;
    this.sounds.king.volume = 0.9;
  }

  playPieceMove(piece: ChessPiece) {
    if (this.enabled && this.sounds[piece.type]) {
      this.sounds[piece.type].currentTime = 0;
      this.sounds[piece.type].play().catch(() => {});
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

export const pieceSoundManager = new PieceSoundManager();
