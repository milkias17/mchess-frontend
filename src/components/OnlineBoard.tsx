import {
  useBoard,
  type MMove,
  type PostHook,
  type PreHook,
} from "@/hooks/useBoard";
import type { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import ChessTimers from "./Counter";
import moveSound from "../assets/sounds/Move.ogg";
import captureSound from "../assets/sounds/Capture.ogg";
import type { Chess, Move } from "chess.js";
import { useGameWebSocket, type GameWebSocket } from "@/hooks/useWebsocket";
import Loading from "./Loading";

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

const moveAudio = new Audio(moveSound);
const captureAudio = new Audio(captureSound);

type BoardProps = {
  gameId: string;
  boardWidth?: number;
  preHookFunctions?: PreHook[];
  postHookFunctions?: PostHook[];
  gameWebSocket: GameWebSocket;
};

function getInCheckStyle(game: Chess) {
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

export default function OnlineBoard(props: BoardProps) {
  const {
    game,
    makeMove,
    addPostHook,
    addPreHook,
    removePostHook,
    removePreHook,
    setGameFen,
  } = useBoard(() => {
    console.log("Checkmate!");
  });
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMovedToSquare, setLastMovedToSquare] = useState<Square | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(props.boardWidth ?? 800);
  const {
    lastReceivedMove,
    gameFen,
    currentTurn,
    sendMove,
    hasStarted,
    isConnected,
    clientPlayerColor,
    game: liveGame,
  } = props.gameWebSocket;

  useEffect(() => {
    setGameFen(gameFen);
  }, [gameFen]);

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
    if (props.preHookFunctions && props.preHookFunctions.length > 0) {
      for (const fn of props.preHookFunctions) {
        addPreHook(fn);
      }
    }

    addPostHook((move) => {
      sendMove(move);
    }, "sendMove");

    if (props.postHookFunctions && props.postHookFunctions.length > 0) {
      for (const fn of props.postHookFunctions) {
        addPostHook(fn);
      }
    }
  }, []);

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
  }, []);

  const hintedSquareStyles = useMemo(() => {
    if (!selectedSquare) {
      return null;
    }

    const moves = game.moves({
      square: selectedSquare,
      verbose: true,
    });

    return moves.map((move) => move.to);
  }, [selectedSquare, game]);

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    if (piece.at(0) !== clientPlayerColor) {
      return false;
    }

    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
    });

    if (move == null) {
      return false;
    }

    return true;
  }

  if (!liveGame) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col flex-1 lg:flex-row mx-8 items-center">
      <div
        ref={containerRef}
        className="flex-1 mx-2 md:mx-10 lg:mx-20 basis-3/4"
      >
        <Chessboard
          boardOrientation={clientPlayerColor === "w" ? "white" : "black"}
          customBoardStyle={{
            ...(boardWidth >= 500 && { margin: "auto" }),
          }}
          onPieceDragBegin={(piece, sourceSquare) => {
            const squarePiece = game.get(sourceSquare);
            if (!squarePiece) {
              return;
            }
            if (
              squarePiece.color !== game.turn() ||
              squarePiece.color !== clientPlayerColor
            ) {
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
              if (piece?.color !== clientPlayerColor) {
                return;
              }
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
            ...(lastMovedToSquare != null &&
              game.turn() !== clientPlayerColor && {
              [lastMovedToSquare]: {
                backgroundColor: "rgba(255, 255, 0, 0.3)",
              },
            }),
            ...(lastReceivedMove != null &&
              game.turn() === clientPlayerColor && {
              [lastReceivedMove.to]: {
                backgroundColor: "rgba(255, 255, 0, 0.3)",
              },
            }),

            ...getInCheckStyle(game),
          }}
        />
      </div>
      <div className="basis-1/5 flex flex-col justify-center items-center">
        <ChessTimers
          clientColor={clientPlayerColor}
          whiteTime={liveGame.white_time_ms}
          blackTime={liveGame.black_time_ms}
          increment={liveGame.increment_ms}
          onWhiteTimeout={() => console.log("White lost")}
          onBlackTimeout={() => console.log("Black Lost")}
          isWhiteTurn={game.turn() === "w"}
        />
      </div>
    </div>
  );
}
