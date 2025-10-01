import { useState } from "react";
import { ChessPiece } from "./ChessPiece";
import { useChessStore } from "@/store/chessStore";

interface Board3DProps {
  selectedSquare: [number, number] | null;
  onSquareClick: (square: [number, number] | null) => void;
}

export const Board3D = ({ selectedSquare, onSquareClick }: Board3DProps) => {
  const { pieces, movePiece, isValidMove, theme } = useChessStore();

  const getLightSquareColor = () => {
    return theme === "light" ? "#f0d9b5" : "#b58863";
  };

  const getDarkSquareColor = () => {
    return theme === "light" ? "#b58863" : "#8b4513";
  };

  const getSquareColor = (x: number, z: number) => {
    return (x + z) % 2 === 0 ? getLightSquareColor() : getDarkSquareColor();
  };

  const isSquareSelected = (x: number, z: number) => {
    return selectedSquare?.[0] === x && selectedSquare?.[1] === z;
  };

  const isValidMoveSquare = (x: number, z: number) => {
    if (!selectedSquare) return false;
    return isValidMove(selectedSquare, [x, z]);
  };

  const handleSquareClick = (x: number, z: number) => {
    if (selectedSquare) {
      // Try to move piece
      const piece = pieces.find(
        p => p.position[0] === selectedSquare[0] && p.position[1] === selectedSquare[1]
      );
      if (piece && isValidMove(selectedSquare, [x, z])) {
        movePiece(selectedSquare, [x, z]);
        onSquareClick(null);
        return;
      }
    }
    
    // Select new square if it has a piece
    const pieceAtSquare = pieces.find(p => p.position[0] === x && p.position[1] === z);
    if (pieceAtSquare) {
      onSquareClick([x, z]);
    } else {
      onSquareClick(null);
    }
  };

  return (
    <group>
      {/* Board squares */}
      {Array.from({ length: 8 }).map((_, x) =>
        Array.from({ length: 8 }).map((_, z) => {
          const selected = isSquareSelected(x, z);
          const validMove = isValidMoveSquare(x, z);
          
          return (
            <group key={`square-${x}-${z}`}>
              {/* Square */}
              <mesh
                position={[x - 3.5, 0.01, z - 3.5]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                onClick={() => handleSquareClick(x, z)}
              >
                <planeGeometry args={[0.98, 0.98]} />
                <meshStandardMaterial
                  color={selected ? "#ffd700" : getSquareColor(x, z)}
                  metalness={0.1}
                  roughness={0.8}
                  emissive={selected ? "#ffd700" : validMove ? "#00ff00" : "#000000"}
                  emissiveIntensity={selected ? 0.3 : validMove ? 0.2 : 0}
                />
              </mesh>
              
              {/* Valid move indicator */}
              {validMove && (
                <mesh position={[x - 3.5, 0.05, z - 3.5]}>
                  <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                  <meshStandardMaterial
                    color="#00ff00"
                    transparent
                    opacity={0.6}
                    emissive="#00ff00"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* Board frame */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[8.5, 0.4, 8.5]} />
        <meshStandardMaterial
          color={theme === "light" ? "#8b4513" : "#2c1810"}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Board border trim */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.02, 8.2]} />
        <meshStandardMaterial
          color={theme === "light" ? "#654321" : "#1a0f0a"}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Chess pieces */}
      {pieces.map((piece, index) => (
        <ChessPiece
          key={`${piece.color}-${piece.type}-${index}`}
          type={piece.type}
          color={piece.color}
          position={piece.position}
          selected={isSquareSelected(piece.position[0], piece.position[1])}
          onClick={() => handleSquareClick(piece.position[0], piece.position[1])}
        />
      ))}

      {/* Coordinate labels would go here in a more advanced version */}
    </group>
  );
};
