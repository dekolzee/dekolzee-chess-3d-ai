import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { Cylinder, Sphere, Cone } from "@react-three/drei";

interface ChessPieceProps {
  type: string;
  color: string;
  position: [number, number];
  selected: boolean;
  onClick: () => void;
}

export const ChessPiece = ({ type, color, position, selected, onClick }: ChessPieceProps) => {
  const meshRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
    } else if (meshRef.current) {
      meshRef.current.position.y = 0.4;
    }
  });

  const pieceColor = color === "white" ? "#f5f5f5" : "#2d2d2d";
  const metalness = color === "white" ? 0.4 : 0.6;
  const roughness = color === "white" ? 0.6 : 0.4;

  const renderPieceGeometry = () => {
    switch (type) {
      case "pawn":
        return (
          <group>
            <Sphere args={[0.2, 16, 16]} position={[0, 0.35, 0]} />
            <Cylinder args={[0.18, 0.25, 0.3, 16]} position={[0, 0.15, 0]} />
            <Cylinder args={[0.28, 0.28, 0.1, 16]} position={[0, 0.05, 0]} />
          </group>
        );
      
      case "rook":
        return (
          <group>
            <Cylinder args={[0.25, 0.25, 0.15, 4]} position={[0, 0.5, 0]} />
            <Cylinder args={[0.22, 0.25, 0.4, 16]} position={[0, 0.25, 0]} />
            <Cylinder args={[0.3, 0.3, 0.1, 16]} position={[0, 0.05, 0]} />
          </group>
        );
      
      case "knight":
        return (
          <group>
            <Cone args={[0.25, 0.5, 4]} position={[0, 0.35, 0]} rotation={[0, Math.PI / 4, 0]} />
            <Cylinder args={[0.28, 0.28, 0.1, 16]} position={[0, 0.05, 0]} />
          </group>
        );
      
      case "bishop":
        return (
          <group>
            <Sphere args={[0.15, 16, 16]} position={[0, 0.55, 0]} />
            <Cone args={[0.2, 0.4, 16]} position={[0, 0.3, 0]} />
            <Cylinder args={[0.25, 0.28, 0.15, 16]} position={[0, 0.1, 0]} />
            <Cylinder args={[0.3, 0.3, 0.08, 16]} position={[0, 0.04, 0]} />
          </group>
        );
      
      case "queen":
        return (
          <group>
            <Sphere args={[0.18, 16, 16]} position={[0, 0.65, 0]} />
            <Cone args={[0.22, 0.3, 8]} position={[0, 0.45, 0]} />
            <Cylinder args={[0.25, 0.25, 0.25, 16]} position={[0, 0.25, 0]} />
            <Cylinder args={[0.32, 0.32, 0.1, 16]} position={[0, 0.05, 0]} />
          </group>
        );
      
      case "king":
        return (
          <group>
            <Cylinder args={[0.05, 0.05, 0.25, 8]} position={[0, 0.75, 0]} />
            <Cylinder args={[0.15, 0.15, 0.05, 8]} position={[0, 0.62, 0]} />
            <Sphere args={[0.2, 16, 16]} position={[0, 0.55, 0]} />
            <Cylinder args={[0.25, 0.25, 0.3, 16]} position={[0, 0.3, 0]} />
            <Cylinder args={[0.32, 0.32, 0.1, 16]} position={[0, 0.05, 0]} />
          </group>
        );
      
      default:
        return <Cylinder args={[0.25, 0.25, 0.5, 16]} />;
    }
  };

  return (
    <group
      ref={meshRef}
      position={[position[0] - 3.5, selected ? 0.6 : 0.4, position[1] - 3.5]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow receiveShadow>
        {renderPieceGeometry()}
        <meshStandardMaterial
          color={pieceColor}
          metalness={metalness}
          roughness={roughness}
          emissive={selected ? (color === "white" ? "#ffffff" : "#444444") : pieceColor}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
};
