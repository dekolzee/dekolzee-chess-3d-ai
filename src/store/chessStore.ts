import { create } from "zustand";

export interface ChessPiece {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  color: "white" | "black";
  position: [number, number];
}

interface ChessStore {
  pieces: ChessPiece[];
  theme: "light" | "dark";
  currentTurn: "white" | "black";
  moveHistory: string[];
  capturedPieces: ChessPiece[];
  
  setTheme: (theme: "light" | "dark") => void;
  movePiece: (from: [number, number], to: [number, number]) => void;
  isValidMove: (from: [number, number], to: [number, number]) => boolean;
  resetGame: () => void;
}

const initialPieces: ChessPiece[] = [
  // White pieces (bottom, z=0,1)
  { type: "rook", color: "white", position: [0, 0] },
  { type: "knight", color: "white", position: [1, 0] },
  { type: "bishop", color: "white", position: [2, 0] },
  { type: "queen", color: "white", position: [3, 0] },
  { type: "king", color: "white", position: [4, 0] },
  { type: "bishop", color: "white", position: [5, 0] },
  { type: "knight", color: "white", position: [6, 0] },
  { type: "rook", color: "white", position: [7, 0] },
  ...Array.from({ length: 8 }, (_, i) => ({ 
    type: "pawn" as const, 
    color: "white" as const, 
    position: [i, 1] as [number, number] 
  })),
  
  // Black pieces (top, z=6,7)
  { type: "rook", color: "black", position: [0, 7] },
  { type: "knight", color: "black", position: [1, 7] },
  { type: "bishop", color: "black", position: [2, 7] },
  { type: "queen", color: "black", position: [3, 7] },
  { type: "king", color: "black", position: [4, 7] },
  { type: "bishop", color: "black", position: [5, 7] },
  { type: "knight", color: "black", position: [6, 7] },
  { type: "rook", color: "black", position: [7, 7] },
  ...Array.from({ length: 8 }, (_, i) => ({ 
    type: "pawn" as const, 
    color: "black" as const, 
    position: [i, 6] as [number, number] 
  })),
];

export const useChessStore = create<ChessStore>((set, get) => ({
  pieces: initialPieces,
  theme: "light",
  currentTurn: "white",
  moveHistory: [],
  capturedPieces: [],

  setTheme: (theme) => set({ theme }),

  isValidMove: (from, to) => {
    const state = get();
    const piece = state.pieces.find(
      p => p.position[0] === from[0] && p.position[1] === from[1]
    );
    
    if (!piece) return false;
    if (piece.color !== state.currentTurn) return false;
    
    const targetPiece = state.pieces.find(
      p => p.position[0] === to[0] && p.position[1] === to[1]
    );
    
    // Can't capture your own piece
    if (targetPiece && targetPiece.color === piece.color) return false;
    
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    
    switch (piece.type) {
      case "pawn": {
        const direction = piece.color === "white" ? 1 : -1;
        const startRow = piece.color === "white" ? 1 : 6;
        
        // Move forward
        if (dx === 0 && dz === direction && !targetPiece) return true;
        
        // First move can be 2 squares
        if (dx === 0 && dz === direction * 2 && from[1] === startRow && !targetPiece) {
          const middleSquare = state.pieces.find(
            p => p.position[0] === from[0] && p.position[1] === from[1] + direction
          );
          if (!middleSquare) return true;
        }
        
        // Capture diagonally
        if (Math.abs(dx) === 1 && dz === direction && targetPiece) return true;
        
        return false;
      }
      
      case "rook":
        if (dx === 0 || dz === 0) {
          return !isPathBlocked(from, to, state.pieces);
        }
        return false;
      
      case "knight":
        return (Math.abs(dx) === 2 && Math.abs(dz) === 1) || 
               (Math.abs(dx) === 1 && Math.abs(dz) === 2);
      
      case "bishop":
        if (Math.abs(dx) === Math.abs(dz)) {
          return !isPathBlocked(from, to, state.pieces);
        }
        return false;
      
      case "queen":
        if (dx === 0 || dz === 0 || Math.abs(dx) === Math.abs(dz)) {
          return !isPathBlocked(from, to, state.pieces);
        }
        return false;
      
      case "king":
        return Math.abs(dx) <= 1 && Math.abs(dz) <= 1;
      
      default:
        return false;
    }
  },

  movePiece: (from, to) => {
    const state = get();
    
    if (!state.isValidMove(from, to)) return;
    
    const pieceIndex = state.pieces.findIndex(
      p => p.position[0] === from[0] && p.position[1] === from[1]
    );
    
    if (pieceIndex === -1) return;
    
    const targetPieceIndex = state.pieces.findIndex(
      p => p.position[0] === to[0] && p.position[1] === to[1]
    );
    
    const newPieces = [...state.pieces];
    const capturedPieces = [...state.capturedPieces];
    
    // Capture piece if exists
    if (targetPieceIndex !== -1) {
      capturedPieces.push(newPieces[targetPieceIndex]);
      newPieces.splice(targetPieceIndex, 1);
    }
    
    // Move piece
    const movedPieceIndex = newPieces.findIndex(
      p => p.position[0] === from[0] && p.position[1] === from[1]
    );
    newPieces[movedPieceIndex] = {
      ...newPieces[movedPieceIndex],
      position: to,
    };
    
    // Switch turn
    const nextTurn = state.currentTurn === "white" ? "black" : "white";
    
    set({
      pieces: newPieces,
      capturedPieces,
      currentTurn: nextTurn,
      moveHistory: [...state.moveHistory, `${from[0]},${from[1]} → ${to[0]},${to[1]}`],
    });
  },

  resetGame: () => set({
    pieces: initialPieces,
    currentTurn: "white",
    moveHistory: [],
    capturedPieces: [],
  }),
}));

// Helper function to check if path is blocked
function isPathBlocked(
  from: [number, number],
  to: [number, number],
  pieces: ChessPiece[]
): boolean {
  const dx = Math.sign(to[0] - from[0]);
  const dz = Math.sign(to[1] - from[1]);
  
  let x = from[0] + dx;
  let z = from[1] + dz;
  
  while (x !== to[0] || z !== to[1]) {
    if (pieces.some(p => p.position[0] === x && p.position[1] === z)) {
      return true;
    }
    x += dx;
    z += dz;
  }
  
  return false;
}
