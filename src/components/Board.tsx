import { useBoard } from "@/hooks/useBoard";
import type { Piece, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function Board() {
  const { game, makeMove } = useBoard();

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
    })

    if (move == null) {
      return false;
    }

    return true;
  }
  return (
    <Chessboard position={game.fen()} />
  )
}
