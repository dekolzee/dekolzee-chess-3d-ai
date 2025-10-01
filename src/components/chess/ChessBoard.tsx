import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Board3D } from "./Board3D";
import { Suspense } from "react";

interface ChessBoardProps {
  selectedSquare: [number, number] | null;
  onSquareClick: (square: [number, number] | null) => void;
}

export const ChessBoard = ({ selectedSquare, onSquareClick }: ChessBoardProps) => {
  return (
    <div className="glass-panel rounded-2xl p-4 h-[700px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      <Canvas shadows className="rounded-xl">
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 8, 8]} fov={50} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />
          <pointLight position={[10, 5, 10]} intensity={0.5} color="#06b6d4" />
          
          <Board3D 
            selectedSquare={selectedSquare}
            onSquareClick={onSquareClick}
          />
          
          <OrbitControls
            enablePan={false}
            minDistance={6}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Corner decorations */}
      <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-accent/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
    </div>
  );
};
