import ErrorDisplay from "@/components/Error";
import Loading from "@/components/Loading";
import axiosClient from "@/lib/apiClient";
import type { GameEntity, IMove } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createRoute, useParams, type AnyRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Chessboard } from "react-chessboard";
import moveSound from "../assets/sounds/Move.ogg";
import captureSound from "../assets/sounds/Capture.ogg";
import { useAuth } from "@/hooks/useAuth";
import { Chess } from "chess.js";
import { getDebouncedFunction } from "@/lib/getDebouncedFunction";
import { getResult } from "@/lib/utils";

const moveAudio = new Audio(moveSound);
const captureAudio = new Audio(captureSound);

function getResultColor(result: string) {
  switch (result) {
    case "Win":
      return "badge-success";
    case "Loss":
      return "badge-error";
    case "Draw":
      return "badge-ghost";
    default:
      return "";
  }
}

function getFenHistory(moves: IMove[]) {
  const fenHistory: string[] = [];
  if (moves.length === 0) {
    return fenHistory;
  }

  fenHistory.push(moves[0].before);

  for (const move of moves) {
    fenHistory.push(move.after);
  }

  return fenHistory;
}

function CompletedChessGame() {
  const { gameId } = useParams({
    from: "/authenticated/completed-game/$gameId",
  });

  const user = useAuth.use.user();

  const containerRef = useRef<HTMLTableSectionElement>(null);
  const activeRef = useRef<HTMLTableRowElement>(null);

  const [boardWidth, setBoardWidth] = useState(800);

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

  const { data: gameEntity, isLoading } = useQuery({
    queryKey: ["completed-game", gameId],
    queryFn: async () => {
      const res = await axiosClient.get<GameEntity>(`/game/${gameId}`);
      console.log(res.data);
      return res.data;
    },
  });

  const fenHistory = useMemo(
    () => (gameEntity != null ? getFenHistory(gameEntity.moves) : []),
    [gameEntity],
  );

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  useEffect(() => {
    if (activeRef.current == null || containerRef.current == null) return;

    const container = containerRef.current;
    const element = activeRef.current;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const offsetTop = elementRect.top - containerRect.top;
    const offsetBottom = elementRect.bottom - containerRect.top;

    if (offsetTop < 0) {
      container.scrollTop += offsetTop - 10;
    } else if (offsetBottom > container.clientHeight) {
      container.scrollTop += offsetBottom - container.clientHeight + 10;
    }
  }, [currentMoveIndex]);

  const inCheckStyle = useMemo(() => {
    const game = new Chess(fenHistory[currentMoveIndex]);
    if (!game.inCheck()) {
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
  }, [fenHistory, currentMoveIndex]);

  const handleKeyDownI = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setCurrentMoveIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (event.key === "ArrowRight") {
        setCurrentMoveIndex((prevIndex) => {
          const newIndex = Math.min(prevIndex + 1, fenHistory.length - 1);
          if (newIndex !== prevIndex) {
            playMoveAudio(newIndex);
          }
          return Math.min(prevIndex + 1, fenHistory.length - 1);
        });
      }
    },
    [fenHistory],
  );

  const handleKeyDown = getDebouncedFunction(handleKeyDownI, 250);

  const playMoveAudio = useCallback(
    (moveIndex: number) => {
      if (
        gameEntity == null ||
        moveIndex < 0 ||
        moveIndex >= gameEntity.moves.length + 1
      ) {
        return;
      }

      const move = gameEntity.moves[moveIndex - 1];
      if (move.san.includes("x")) {
        captureAudio.play();
      } else {
        moveAudio.play();
      }
    },
    [gameEntity],
  );

  const setCurMove = useCallback(
    (moveIndex: number) => {
      if (
        moveIndex < 0 ||
        moveIndex >= fenHistory.length ||
        gameEntity == null
      ) {
        return;
      }

      const move = gameEntity.moves[moveIndex];
      if (move.san.includes("x")) {
        captureAudio.play();
      } else {
        moveAudio.play();
      }
      setCurrentMoveIndex(moveIndex);
    },
    [gameEntity, fenHistory],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (isLoading) {
    return <Loading />;
  }

  if (!gameEntity) {
    return <ErrorDisplay message="Could not load game." />;
  }

  return (
    <div className="flex flex-col xl:flex-row items-center mx-8 gap-2">
      <div className="w-full xl:basis-1/4 order-3 xl:order-1">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl justify-center mb-6">
              Game Information
            </h2>

            {/* Players */}
            <div className="flex items-center justify-around mb-6">
              {/* White */}
              <div className="flex flex-col items-center gap-2">
                <div className="avatar">
                  <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <span className="flex justify-center items-center w-full h-full text-xl font-bold bg-neutral text-neutral-content">
                      {gameEntity.white_username[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="font-semibold">
                  {gameEntity.white_username}
                </span>
              </div>

              <span className="text-lg font-bold">vs</span>

              {/* Black */}
              <div className="flex flex-col items-center gap-2">
                <div className="avatar">
                  <div className="w-16 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                    <span className="flex justify-center items-center w-full h-full text-xl font-bold bg-neutral text-neutral-content">
                      {gameEntity.black_username[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="font-semibold">
                  {gameEntity.black_username}
                </span>
              </div>
            </div>

            <div className="divider" />

            {/* Result + Reason */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between">
                <span className="font-bold">Result:</span>
                <span
                  className={`badge badge-lg ${getResultColor(getResult(gameEntity.winner, gameEntity.white_user_id === user?.userId))}`}
                >
                  {gameEntity?.winner || "Ongoing"}
                </span>
              </div>
              {gameEntity?.winning_reason && (
                <div className="flex justify-between">
                  <span className="font-bold">Reason:</span>
                  <span className="badge badge-outline badge-lg">
                    {gameEntity?.winning_reason}
                  </span>
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Stats */}
            <div className="stats stats-vertical shadow bg-base-100">
              <div className="stat">
                <div className="stat-title">Started At</div>
                <div className="stat-value text-lg">
                  {new Date(gameEntity.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 order-1 xl:order-2">
        <Chessboard
          arePiecesDraggable={false}
          boardOrientation={
            gameEntity.black_user_id === user?.userId ? "black" : "white"
          }
          customBoardStyle={{ margin: "auto" }}
          customSquareStyles={{
            ...(currentMoveIndex !== 0 && {
              [gameEntity.moves[currentMoveIndex - 1].to]: {
                backgroundColor: "rgba(255, 255, 0, 0.3)",
              },
            }),
            ...inCheckStyle,
          }}
          position={fenHistory[currentMoveIndex]}
          boardWidth={boardWidth}
        />
      </div>

      {/* Move list */}
      <div
        ref={containerRef}
        className="w-full xl:w-96 p-4 rounded-2xl shadow bg-base-200 overflow-y-auto order-2 max-h-96 xl:order-3"
      >
        <h2 className="text-lg font-semibold mb-4 text-center xl:text-start">
          Moves
        </h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({
                length: Math.ceil(gameEntity.moves.length / 2),
              }).map((_, i) => {
                const whiteIndex = i * 2 + 1; // fenHistory index for white
                const blackIndex = i * 2 + 2; // fenHistory index for black

                const whiteMove = gameEntity.moves[whiteIndex - 1]?.san;
                const blackMove = gameEntity.moves[blackIndex - 1]?.san;

                const whiteActive = currentMoveIndex === whiteIndex;
                const blackActive = currentMoveIndex === blackIndex;

                return (
                  <tr
                    ref={whiteActive || blackActive ? activeRef : null}
                    key={`${whiteIndex}${blackIndex}`}
                  >
                    <td className="font-bold">{i + 1}</td>
                    <td>
                      {whiteMove ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentMoveIndex((prev) => {
                              if (prev === whiteIndex - 1) {
                                playMoveAudio(whiteIndex);
                              }
                              return whiteIndex;
                            });
                          }}
                          className={`btn btn-sm w-full justify-start ${whiteActive ? "btn-primary" : "btn-ghost"
                            }`}
                        >
                          {whiteMove}
                        </button>
                      ) : null}
                    </td>
                    <td>
                      {blackMove ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentMoveIndex((prev) => {
                              if (prev === blackIndex - 1) {
                                playMoveAudio(blackIndex);
                              }
                              return blackIndex;
                            })
                          }
                          className={`btn btn-sm w-full justify-start ${blackActive ? "btn-primary" : "btn-ghost"
                            }`}
                        >
                          {blackMove}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: "/completed-game/$gameId",
    component: CompletedChessGame,
    getParentRoute: () => parentRoute,
  });
