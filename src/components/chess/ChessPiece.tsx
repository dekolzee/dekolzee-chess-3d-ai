import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

interface ChessPieceProps {
  type: string;
  color: string;
  position: [number, number];
  selected: boolean;
}

export const ChessPiece = ({ type, color, position, selected }: ChessPieceProps) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  const getPieceGeometry = () => {
    switch (type) {
      case "pawn":
        return <sphereGeometry args={[0.25, 16, 16]} />;
      case "rook":
        return <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />;
      case "knight":
        return <coneGeometry args={[0.3, 0.7, 4]} />;
      case "bishop":
        return <coneGeometry args={[0.25, 0.8, 8]} />;
      case "queen":
        return <cylinderGeometry args={[0.35, 0.25, 0.8, 8]} />;
      case "king":
        return <cylinderGeometry args={[0.3, 0.3, 0.9, 8]} />;
      default:
        return <boxGeometry args={[0.4, 0.6, 0.4]} />;
    }
  };

  const pieceColor = color === "white" ? "#e8e8f0" : "#1a1a24";
  const emissiveColor = color === "white" ? "#8b5cf6" : "#06b6d4";

  return (
    <mesh
      ref={meshRef}
      position={[position[0] - 3.5, selected ? 0.6 : 0.4, position[1] - 3.5]}
      castShadow
    >
      {getPieceGeometry()}
      <meshStandardMaterial
        color={pieceColor}
        metalness={0.6}
        roughness={0.4}
        emissive={selected ? emissiveColor : pieceColor}
        emissiveIntensity={selected ? 0.5 : 0}
      />
    </mesh>
  );
};
