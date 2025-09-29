import { useBoard, type MMove } from "@/hooks/useBoard";
import {
  useSearch,
  createRoute,
  type AnyRoute,
  useNavigate,
} from "@tanstack/react-router";
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

function getTimeAndIncrement(timeFormat: string) {
  const splitted = timeFormat.split("+");
  if (splitted.length !== 2) {
    throw new Error("Invalid time format");
  }

  return {
    time: Number(splitted[0]),
    increment: Number(splitted[1]),
  };
}

function ChessGame() {
  const {
    game,
    makeMove,
    addPostHook,
    addPreHook,
    removePostHook,
    removePreHook,
  } = useBoard(() => {
    alert("Checkmate!");
  });
  const navigate = useNavigate();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMovedToSquare, setLastMovedToSquare] = useState<Square | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(800);

  const { timeFormat } = useSearch({
    from: "/authenticated/game",
  });
  const { time, increment } = getTimeAndIncrement(timeFormat);

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

  function getHintStyles(moves: string[] | null) {
    if (moves == null) {
      return {};
    }

    const styleMap = new Map();

    for (const move of moves) {
      const piece = game.get(move as Square);
      if (piece == null) {
        styleMap.set(move, {
          background:
            "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
          borderRadius: "50%",
        });
      } else {
        const captureStyle = {
          background: "rgba(255, 0, 0, 0.15)",
          borderRadius: "50%",
          boxShadow:
            "0 0 0 3px rgba(255, 0, 0, 0.4)," + "0 0 15px rgba(255, 0, 0, 0.2)",
        };
        styleMap.set(move, captureStyle);
      }
    }

    return Object.fromEntries(styleMap.entries());
  }

  useEffect(() => {
    const handleResize = () => {
      const curWidth = window.innerWidth;

      let appliedWidth = curWidth - 50;
      if (appliedWidth < 350) {
        appliedWidth = 350;
      } else if (appliedWidth > 800) {
        appliedWidth = 800;
      }
      setBoardWidth(appliedWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const preHook = useCallback(
    (move: MMove) => {
      setLastMovedToSquare(move.to as Square);

      const piece = game.get(move.to as Square);

      if (piece == null) {
        moveAudio.play();
      } else {
        captureAudio.play();
      }
    },
    [game],
  );

  useEffect(() => {
    const postHook = () => {
      setSelectedSquare(null);
    };
    addPreHook(preHook);
    addPostHook(postHook);

    return () => {
      removePreHook(preHook);
      removePostHook(postHook);
    };
  }, [preHook]);

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

  function handleResign() {
    if (game.isGameOver()) {
      return;
    }

    navigate({
      to: "/",
    });
  }

  return (
    <div className="flex flex-col lg:flex-row my-10 mx-8 items-center">
      <div ref={containerRef} className="mx-2 md:mx-10 lg:mx-20 basis-3/4">
        <Chessboard
          arePiecesDraggable={true}
          showBoardNotation={true}
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
            ...(lastMovedToSquare != null && {
              [lastMovedToSquare]: {
                backgroundColor: "rgba(255, 255, 0, 0.3)",
              },
            }),
            ...getHintStyles(hintedSquareStyles),
            ...(selectedSquare != null && {
              [selectedSquare]: {
                backgroundColor: "#1e90ff",
              },
            }),

            ...getInCheckStyle(),
          }}
        />
      </div>
      <div className="basis-1/5 flex flex-col justify-center items-center gap-6">
        <ChessTimers
          clientColor={"w"}
          increment={increment * 1000}
          whiteTime={time * 60 * 1000}
          blackTime={time * 60 * 1000}
          onWhiteTimeout={() => alert("White lost")}
          onBlackTimeout={() => alert("Black Lost")}
          isWhiteTurn={game.turn() === "w"}
        />

        {!game.isGameOver() && (
          <button
            type="button"
            className="btn btn-error btn-xl rounded-xl shadow-lg hover:scale-105 transition-transform"
            onClick={handleResign}
          >
            ♟️ Resign
          </button>
        )}
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
