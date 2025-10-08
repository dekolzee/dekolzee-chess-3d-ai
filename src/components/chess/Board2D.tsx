import { ChessPiece as ChessPieceType } from "@/store/chessStore";
import { motion } from "framer-motion";

interface Board2DProps {
  pieces: ChessPieceType[];
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
  onSquareClick: (x: number, y: number) => void;
  theme: "light" | "dark";
}

const getPieceImage = (piece: ChessPieceType) => {
  const color = piece.color === "white" ? "white" : "black";
  const type = piece.type;
  return `/pieces/${color}-${type}.png`;
};

export const Board2D = ({ pieces, selectedSquare, validMoves, onSquareClick, theme }: Board2DProps) => {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const isSquareSelected = (x: number, y: number) => {
    return selectedSquare?.[0] === x && selectedSquare?.[1] === y;
  };

  const isValidMove = (x: number, y: number) => {
    return validMoves.some(([mx, my]) => mx === x && my === y);
  };

  const getPieceAtSquare = (x: number, y: number) => {
    return pieces.find(p => p.position[0] === x && p.position[1] === y);
  };

  const getSquareColor = (x: number, y: number) => {
    const isLight = (x + y) % 2 === 0;
    if (theme === "light") {
      return isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]";
    }
    return isLight ? "bg-[#779556]" : "bg-[#ede6d6]";
  };

  return (
    <div className="glass-panel rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="aspect-square bg-[#302e2b] p-2 rounded-lg shadow-2xl">
        <div className="grid grid-cols-8 gap-0 h-full w-full">
          {ranks.map((rank, y) =>
            files.map((file, x) => {
              const piece = getPieceAtSquare(x, y);
              const selected = isSquareSelected(x, y);
              const validMove = isValidMove(x, y);

              return (
                <motion.div
                  key={`${file}${rank}`}
                  className={`relative cursor-pointer ${getSquareColor(x, y)} transition-all hover:brightness-110 ${
                    selected ? "ring-4 ring-yellow-400 ring-inset z-10" : ""
                  }`}
                  onClick={() => onSquareClick(x, y)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Coordinates */}
                  {x === 0 && (
                    <div className="absolute top-1 left-1 text-xs font-bold opacity-70">
                      {rank}
                    </div>
                  )}
                  {y === 7 && (
                    <div className="absolute bottom-1 right-1 text-xs font-bold opacity-70">
                      {file}
                    </div>
                  )}

                  {/* Valid move indicator */}
                  {validMove && !piece && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-black/30 rounded-full" />
                    </div>
                  )}

                  {validMove && piece && (
                    <div className="absolute inset-0 border-4 border-red-500/50 pointer-events-none" />
                  )}

                  {/* Piece */}
                  {piece && (
                    <motion.img
                      src={getPieceImage(piece)}
                      alt={`${piece.color} ${piece.type}`}
                      className="w-full h-full object-contain p-1 drop-shadow-lg"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};