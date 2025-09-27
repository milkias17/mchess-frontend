import Loading from "@/components/Loading";
import OnlineBoard from "@/components/OnlineBoard";
import { useGameWebSocket } from "@/hooks/useWebsocket";
import { createRoute, type AnyRoute, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

function OnlineChessGame() {
  const { gameId } = useParams({
    from: "/authenticated/online-game/$gameId",
  });

  const gameWebSocket = useGameWebSocket(gameId);

  const gameLink = new URL(window.location.href).toString();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(gameLink);
      toast.success("Link copied!");
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast.error("Failed to copy link.");
    }
  };

  if (gameWebSocket.hasEnded) {
    return <Loading />;
  }

  if (!gameWebSocket.game?.has_begun) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 justify-around my-10">
        <img
          src="/chess-board.png"
          alt="Chessboard"
          className="aspect-square"
        />
        <div className="flex flex-col justify-around gap-8 p-24 lg:p-48 bg-neutral rounded-lg">
          <h2 className="text-3xl font-bold">Waiting for user to join game</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg">Share this link:</p>
            <div className="flex items-center gap-2 bg-base-200 p-3 rounded-lg w-full justify-between">
              <a href={gameLink} className="text-blue-400 truncate flex-grow">
                {gameLink}
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-sm btn-ghost"
                title="Copy link"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <title>Copy Link</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-around my-10">
      <OnlineBoard gameId={gameId} gameWebSocket={gameWebSocket} />
    </div>
  );
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: "/online-game/$gameId",
    component: OnlineChessGame,
    getParentRoute: () => parentRoute,
  });
