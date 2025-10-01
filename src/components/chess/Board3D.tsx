import { useRef } from "react";
import { Mesh } from "three";
import { ChessPiece } from "./ChessPiece";

interface Board3DProps {
  selectedSquare: [number, number] | null;
  onSquareClick: (square: [number, number] | null) => void;
}

const initialPieces = [
  // White pieces (bottom)
  { type: "rook", color: "white", position: [0, 0] as [number, number] },
  { type: "knight", color: "white", position: [1, 0] as [number, number] },
  { type: "bishop", color: "white", position: [2, 0] as [number, number] },
  { type: "queen", color: "white", position: [3, 0] as [number, number] },
  { type: "king", color: "white", position: [4, 0] as [number, number] },
  { type: "bishop", color: "white", position: [5, 0] as [number, number] },
  { type: "knight", color: "white", position: [6, 0] as [number, number] },
  { type: "rook", color: "white", position: [7, 0] as [number, number] },
  ...Array.from({ length: 8 }, (_, i) => ({ 
    type: "pawn", 
    color: "white", 
    position: [i, 1] as [number, number] 
  })),
  
  // Black pieces (top)
  { type: "rook", color: "black", position: [0, 7] as [number, number] },
  { type: "knight", color: "black", position: [1, 7] as [number, number] },
  { type: "bishop", color: "black", position: [2, 7] as [number, number] },
  { type: "queen", color: "black", position: [3, 7] as [number, number] },
  { type: "king", color: "black", position: [4, 7] as [number, number] },
  { type: "bishop", color: "black", position: [5, 7] as [number, number] },
  { type: "knight", color: "black", position: [6, 7] as [number, number] },
  { type: "rook", color: "black", position: [7, 7] as [number, number] },
  ...Array.from({ length: 8 }, (_, i) => ({ 
    type: "pawn", 
    color: "black", 
    position: [i, 6] as [number, number] 
  })),
];

export const Board3D = ({ selectedSquare, onSquareClick }: Board3DProps) => {
  const boardRef = useRef<Mesh>(null);

  const getSquareColor = (x: number, z: number) => {
    return (x + z) % 2 === 0 ? "#2d2d3a" : "#1a1a24";
  };

  const isSquareSelected = (x: number, z: number) => {
    return selectedSquare?.[0] === x && selectedSquare?.[1] === z;
  };

  return (
    <group>
      {/* Board squares */}
      {Array.from({ length: 8 }).map((_, x) =>
        Array.from({ length: 8 }).map((_, z) => {
          const selected = isSquareSelected(x, z);
          return (
            <mesh
              key={`${x}-${z}`}
              position={[x - 3.5, 0, z - 3.5]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
              onClick={() => onSquareClick([x, z])}
            >
              <planeGeometry args={[0.95, 0.95]} />
              <meshStandardMaterial
                color={selected ? "#8b5cf6" : getSquareColor(x, z)}
                metalness={0.3}
                roughness={0.7}
                emissive={selected ? "#8b5cf6" : "#000000"}
                emissiveIntensity={selected ? 0.3 : 0}
              />
            </mesh>
          );
        })
      )}

      {/* Board base */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[8.5, 0.3, 8.5]} />
        <meshStandardMaterial
          color="#0f0f18"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Chess pieces */}
      {initialPieces.map((piece, index) => (
        <ChessPiece
          key={index}
          type={piece.type}
          color={piece.color}
          position={piece.position}
          selected={isSquareSelected(piece.position[0], piece.position[1])}
        />
      ))}
    </group>
  );
};
