import { create } from "zustand";

export interface ChessPiece {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  color: "white" | "black";
  position: [number, number];
}

interface GameState {
  pieces: ChessPiece[];
  currentTurn: "white" | "black";
  moveHistory: string[];
  capturedPieces: ChessPiece[];
  gameStatus: "active" | "check" | "checkmate" | "stalemate";
  winner: "white" | "black" | null;
}

interface ChessStore extends GameState {
  theme: "light" | "dark";
  gameStateHistory: GameState[];
  currentStateIndex: number;
  
  setTheme: (theme: "light" | "dark") => void;
  movePiece: (from: [number, number], to: [number, number]) => void;
  isValidMove: (from: [number, number], to: [number, number]) => boolean;
  resetGame: () => void;
  isKingInCheck: (color: "white" | "black", pieces?: ChessPiece[]) => boolean;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
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

const initialGameState: GameState = {
  pieces: initialPieces,
  currentTurn: "white",
  moveHistory: [],
  capturedPieces: [],
  gameStatus: "active",
  winner: null,
};

export const useChessStore = create<ChessStore>((set, get) => ({
  ...initialGameState,
  theme: "light",
  gameStateHistory: [initialGameState],
  currentStateIndex: 0,

  setTheme: (theme) => set({ theme }),

  isKingInCheck: (color, pieces) => {
    const state = get();
    const piecesToCheck = pieces || state.pieces;
    
    // Find the king
    const king = piecesToCheck.find(p => p.type === "king" && p.color === color);
    if (!king) return false;
    
    // Check if any opponent piece can attack the king
    const opponentColor = color === "white" ? "black" : "white";
    return piecesToCheck.some(p => {
      if (p.color !== opponentColor) return false;
      return canPieceAttack(p, king.position, piecesToCheck);
    });
  },

  isValidMove: (from, to) => {
    const state = get();
    
    // Game must be active
    if (state.gameStatus === "checkmate" || state.gameStatus === "stalemate") return false;
    
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
    
    // Check basic move legality
    if (!isMoveLegal(piece, from, to, state.pieces)) return false;
    
    // Simulate the move to check if it would leave/put king in check
    const simulatedPieces = simulateMove(from, to, state.pieces);
    if (state.isKingInCheck(piece.color, simulatedPieces)) return false;
    
    return true;
  },
    

  movePiece: (from, to) => {
    const state = get();
    
    if (!state.isValidMove(from, to)) return;
    
    const newPieces = simulateMove(from, to, state.pieces);
    const capturedPiece = state.pieces.find(
      p => p.position[0] === to[0] && p.position[1] === to[1]
    );
    
    const capturedPieces = capturedPiece 
      ? [...state.capturedPieces, capturedPiece]
      : state.capturedPieces;
    
    // Switch turn
    const nextTurn = state.currentTurn === "white" ? "black" : "white";
    
    // Check game status
    let gameStatus: "active" | "check" | "checkmate" | "stalemate" = "active";
    let winner: "white" | "black" | null = null;
    
    const isCheck = get().isKingInCheck(nextTurn, newPieces);
    if (isCheck) {
      // Check if it's checkmate
      const hasValidMove = newPieces.some(p => {
        if (p.color !== nextTurn) return false;
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 8; y++) {
            if (isMoveLegal(p, p.position, [x, y], newPieces)) {
              const simPieces = simulateMove(p.position, [x, y], newPieces);
              if (!get().isKingInCheck(nextTurn, simPieces)) {
                return true;
              }
            }
          }
        }
        return false;
      });
      
      if (!hasValidMove) {
        gameStatus = "checkmate";
        winner = state.currentTurn;
      } else {
        gameStatus = "check";
      }
    } else {
      // Check for stalemate
      const hasValidMove = newPieces.some(p => {
        if (p.color !== nextTurn) return false;
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 8; y++) {
            if (isMoveLegal(p, p.position, [x, y], newPieces)) {
              const simPieces = simulateMove(p.position, [x, y], newPieces);
              if (!get().isKingInCheck(nextTurn, simPieces)) {
                return true;
              }
            }
          }
        }
        return false;
      });
      
      if (!hasValidMove) {
        gameStatus = "stalemate";
      }
    }
    
    const newGameState: GameState = {
      pieces: newPieces,
      capturedPieces,
      currentTurn: nextTurn,
      moveHistory: [...state.moveHistory, `${from[0]},${from[1]} → ${to[0]},${to[1]}`],
      gameStatus,
      winner,
    };

    // Update history for undo/redo
    const newHistory = state.gameStateHistory.slice(0, state.currentStateIndex + 1);
    newHistory.push(newGameState);

    set({
      ...newGameState,
      gameStateHistory: newHistory,
      currentStateIndex: newHistory.length - 1,
    });
  },

  resetGame: () => set({
    ...initialGameState,
    gameStateHistory: [initialGameState],
    currentStateIndex: 0,
  }),

  undo: () => {
    const state = get();
    if (state.currentStateIndex > 0) {
      const newIndex = state.currentStateIndex - 1;
      const previousState = state.gameStateHistory[newIndex];
      set({
        ...previousState,
        currentStateIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.currentStateIndex < state.gameStateHistory.length - 1) {
      const newIndex = state.currentStateIndex + 1;
      const nextState = state.gameStateHistory[newIndex];
      set({
        ...nextState,
        currentStateIndex: newIndex,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.currentStateIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.currentStateIndex < state.gameStateHistory.length - 1;
  },
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

// Helper function to check if a move is legal (without considering check)
function isMoveLegal(
  piece: ChessPiece,
  from: [number, number],
  to: [number, number],
  pieces: ChessPiece[]
): boolean {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  
  // Can't move to same square
  if (dx === 0 && dz === 0) return false;
  
  const targetPiece = pieces.find(
    p => p.position[0] === to[0] && p.position[1] === to[1]
  );
  
  switch (piece.type) {
    case "pawn": {
      const direction = piece.color === "white" ? 1 : -1;
      const startRow = piece.color === "white" ? 1 : 6;
      
      // Move forward
      if (dx === 0 && dz === direction && !targetPiece) return true;
      
      // First move can be 2 squares
      if (dx === 0 && dz === direction * 2 && from[1] === startRow && !targetPiece) {
        const middleSquare = pieces.find(
          p => p.position[0] === from[0] && p.position[1] === from[1] + direction
        );
        if (!middleSquare) return true;
      }
      
      // Capture diagonally
      if (Math.abs(dx) === 1 && dz === direction && targetPiece && targetPiece.color !== piece.color) return true;
      
      return false;
    }
    
    case "rook":
      if (dx === 0 || dz === 0) {
        return !isPathBlocked(from, to, pieces);
      }
      return false;
    
    case "knight":
      return (Math.abs(dx) === 2 && Math.abs(dz) === 1) || 
             (Math.abs(dx) === 1 && Math.abs(dz) === 2);
    
    case "bishop":
      if (Math.abs(dx) === Math.abs(dz)) {
        return !isPathBlocked(from, to, pieces);
      }
      return false;
    
    case "queen":
      if (dx === 0 || dz === 0 || Math.abs(dx) === Math.abs(dz)) {
        return !isPathBlocked(from, to, pieces);
      }
      return false;
    
    case "king":
      return Math.abs(dx) <= 1 && Math.abs(dz) <= 1;
    
    default:
      return false;
  }
}

// Helper function to check if a piece can attack a position
function canPieceAttack(
  piece: ChessPiece,
  target: [number, number],
  pieces: ChessPiece[]
): boolean {
  return isMoveLegal(piece, piece.position, target, pieces);
}

// Helper function to simulate a move
function simulateMove(
  from: [number, number],
  to: [number, number],
  pieces: ChessPiece[]
): ChessPiece[] {
  const newPieces = pieces.filter(
    p => !(p.position[0] === to[0] && p.position[1] === to[1])
  );
  
  return newPieces.map(p => 
    p.position[0] === from[0] && p.position[1] === from[1]
      ? { ...p, position: to }
      : p
  );
}
