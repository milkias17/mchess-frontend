import { useBoard, type MMove } from "@/hooks/useBoard";
import { useSearch, createRoute, type AnyRoute } from "@tanstack/react-router";
import type { PieceSymbol } from "chess.js";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import type { Piece, Square } from "react-chessboard/dist/chessboard/types";
import moveSound from "../assets/sounds/Move.ogg";
import captureSound from "../assets/sounds/Capture.ogg";
import Counter from "@/components/Counter";
import ChessTimers from "@/components/Counter";

const pieceToPieceSymbol = (piece: Piece): PieceSymbol | null => {
  const symbolPart = piece.slice(1) as "P" | "B" | "N" | "R" | "Q" | "K";

  switch (symbolPart) {
    case "P":
      return "p";
    case "B":
      return "b";
    case "N":
      return "n";
    case "R":
      return "r";
    case "Q":
      return "q";
    case "K":
      return "k";
    default:
      return null; // Or throw an error if the input is invalid
  }
};

const moveAudio = new Audio(moveSound);
const captureAudio = new Audio(captureSound);

function ChessGame() {
  const {
    game,
    makeMove,
    addPostHook,
    addPreHook,
    removePostHook,
    removePreHook,
  } = useBoard();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMovedToSquare, setLastMovedToSquare] = useState<Square | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(800);

  const { timeFormat } = useSearch({
    from: "/authenticated/game",
  });

  function getInCheckStyle() {
    const inCheck = game.inCheck();
    if (!inCheck) {
      return {};
    }

    const kingPosition = game.findPiece({
      color: game.turn(),
      type: "k",
    });

    return {
      [kingPosition[0]]: {
        backgroundColor: "#dc143c",
      },
    };
  }

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        let appliedWidth = width;
        if (appliedWidth < 400) {
          appliedWidth = 400;
        } else if (appliedWidth > 800) {
          appliedWidth = 800;
        }
        setBoardWidth(appliedWidth); // Limit max width if needed
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  const preHook = useCallback(
    (move: MMove) => {
      setLastMovedToSquare(move.to as Square);

      console.log(move);
      const piece = game.get(move.to as Square);
      console.log(piece);

      if (piece == null) {
        moveAudio.play();
      } else {
        captureAudio.play();
      }
    },
    [game],
  );

  useEffect(() => {
    const postHook = (move: MMove) => {
      setSelectedSquare(null);
    };
    addPreHook(preHook);
    addPostHook(postHook);

    return () => {
      removePreHook(preHook);
      removePostHook(postHook);
    };
  }, [preHook]);

  function getHintStyles(moves: string[] | null) {
    const obj = {};
    if (moves == null) {
      return obj;
    }

    for (const move of moves) {
      obj[move] = {
        background:
          "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    }

    return obj;
  }

  const hintedSquareStyles = useMemo(() => {
    if (!selectedSquare) {
      return null;
    }

    const moves = game.moves({
      square: selectedSquare,
      verbose: true,
    });

    return moves.map((move) => move.to);
  }, [selectedSquare]);

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
    });

    if (move == null) {
      return false;
    }

    return true;
  }

  return (
    <div className="flex flex-col lg:flex-row my-10 justify-center items-center">
      <div ref={containerRef} className="flex-1 mx-10 lg:mx-20">
        <Chessboard
          customBoardStyle={{
            ...(boardWidth >= 500 && { margin: "auto" }),
          }}
          onPieceDragBegin={(piece, sourceSquare) => {
            const squarePiece = game.get(sourceSquare);
            if (!squarePiece) {
              return;
            }
            if (squarePiece.color !== game.turn()) {
              return;
            }
            setSelectedSquare(sourceSquare);
          }}
          position={game.fen()}
          boardWidth={boardWidth}
          onPieceDrop={onDrop}
          onSquareClick={(s, p) => {
            const piece = game.get(s);
            if (selectedSquare == null) {
              if (piece != null && piece.color === game.turn()) {
                setSelectedSquare(s);
              }
            } else {
              if (selectedSquare === s) {
                setSelectedSquare(null);
              } else if (hintedSquareStyles?.includes(s)) {
                makeMove({
                  from: selectedSquare,
                  to: s,
                });
              } else if (piece != null && piece.color === game.turn()) {
                setSelectedSquare(s);
              }
            }
          }}
          customSquareStyles={{
            ...getHintStyles(hintedSquareStyles),
            ...(selectedSquare != null && {
              [selectedSquare]: {
                backgroundColor: "#1e90ff",
              },
            }),
            ...(lastMovedToSquare != null && {
              [lastMovedToSquare]: {
                backgroundColor: "rgba(255, 255, 0, 0.3)",
              },
            }),
            ...getInCheckStyle(),
          }}
        />
      </div>
      <div className="basis-1/5 flex flex-col justify-center items-center">
        <ChessTimers
          timeFormat={timeFormat}
          onWhiteTimeout={() => console.log("White lost")}
          onBlackTimeout={() => console.log("Black Lost")}
          isWhiteTurn={game.turn() === "w"}
        />
      </div>
    </div>
  );
}

const PageRoute = (parentRoute: AnyRoute) =>
  createRoute({
    path: "/game",
    component: ChessGame,
    getParentRoute: () => parentRoute,
    validateSearch: (search) => {
      if (search?.timeFormat == null) {
        return {
          timeFormat: null,
        };
      }
      const timeFormat = search?.timeFormat as string;
      return {
        timeFormat: timeFormat,
      };
    },
  });

export default PageRoute;
