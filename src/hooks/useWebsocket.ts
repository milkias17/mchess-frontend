import { useState, useEffect, useCallback, useRef } from "react";
import type { Move } from "chess.js";
import { API_URL, WEBSOCKET_URL } from "@/lib/constants";
import { useAuth } from "./useAuth";
import { refreshAuthToken } from "@/lib/apiClient";
import { accessTokenToUser } from "@/lib/authService";
import type { GameEntity, IMove, LiveGame } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";

type WebSocketMessageRecieve = {
  type: "move" | "gameStateUpdate" | "game_started" | "error" | "game_ended";
  game: LiveGame;
  data: any;
};

type WebSocketMessageSend = {
  type: "move" | "gameStateUpdate" | "game_started" | "error" | "resignation";
  data: any;
};

interface GameStateUpdatePayload {
  fen: string;
  turn: "white" | "black";
  lastMove?: Move;
}

export type GameWebSocket = {
  game: LiveGame | null;
  gameFen: string;
  currentTurn: "white" | "black";
  sendMove: (move: Move) => void;
  sendResignation: () => void;
  isConnected: boolean;
  clientPlayerColor: "w" | "b";
  lastReceivedMove: IMove | null;
  hasStarted: boolean;
};

export function useGameWebSocket(gameId: string) {
  const navigate = useNavigate();
  const ws = useRef<WebSocket | null>(null);
  const [gameFen, setGameFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white");
  const [lastReceivedMove, setLastReceivedMove] = useState<IMove | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [clientPlayerColor, setClientPlayerColor] = useState<"w" | "b">("w");
  const user = useAuth.use.user();
  const setUser = useAuth.use.setUser();
  const [hasEnded, setHasEnded] = useState(false);

  const [game, setGame] = useState<LiveGame | null>(null);

  useEffect(() => {
    console.log("Run with: ", user?.token, " and ", gameId);
    if (user?.token == null && gameId) {
      refreshAuthToken().then(({ accessToken }) => {
        const user = accessTokenToUser(accessToken);
        setUser(user);
      });
      return;
    }
    if (user?.token == null || !gameId) {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        console.log("Closing existing WebSocket due to missing prerequisites.");
        ws.current.close();
      }
      ws.current = null;
      setIsConnected(false);
      return;
    }

    if (
      ws.current != null &&
      ws.current.readyState !== WebSocket.CLOSED &&
      ws.current.readyState !== WebSocket.CLOSING
    ) {
      console.log("Closing existing WebSocket before opening a new one.");
      ws.current.close();
    }

    console.log(`Establishing new WebSocket connection for game: ${gameId}`);
    ws.current = new WebSocket(`${WEBSOCKET_URL}/game/live/${gameId}`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      ws.current?.send(user.token);
      console.log("Authentication token sent.");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message: WebSocketMessageRecieve = JSON.parse(event.data);
      console.log("Recieved message:", message.type);
      switch (message.type) {
        case "gameStateUpdate": {
          const payload = message.data as GameStateUpdatePayload;
          setGameFen(payload.fen);
          setCurrentTurn(payload.turn);
          if (payload.lastMove) {
            setLastReceivedMove(payload.lastMove);
          }
          break;
        }
        case "move": {
          const move = message.data as Move;
          const curGame = message.game;
          setGameFen(move.after);
          setCurrentTurn(move.color === "w" ? "black" : "white");
          setLastReceivedMove(message.data);
          setGame(curGame);
          break;
        }
        case "game_started": {
          const game = message.data as LiveGame;
          if (user == null) {
            throw new Error("User is not logged in");
          }
          console.log("Game started:", game);
          if (game.white_id === user.userId) {
            setClientPlayerColor("w");
          } else if (game.black_id === user.userId) {
            setClientPlayerColor("b");
          }

          if (game.moves != null) {
            const lastMove = game.moves?.[game.moves.length - 1];
            setGameFen(lastMove.after);
            setCurrentTurn(lastMove.color === "w" ? "black" : "white");
            setLastReceivedMove(lastMove);
          }

          setGame(game);
          setHasStarted(true);

          break;
        }
        case "game_ended": {
          console.log("Game ended:", message.data);
          const game = message.data as GameEntity;
          navigate({
            to: "/completed-game/$gameId",
            params: {
              gameId: game.id,
            },
          });
          setHasEnded(true);
          break;
        }
        case "error":
          console.error("WebSocket Error:", message.data);
          break;
        default:
          console.warn("Unknown WebSocket message type:", message.type);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      // Implement reconnection logic here if desired
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      console.log("Cleaning up WebSocket effect.");
      ws.current?.close();
    };
  }, [gameId, user]);

  const sendMove = useCallback(
    (move: Move) => {
      if (ws.current && ws.current?.readyState === WebSocket.OPEN) {
        const message: WebSocketMessageSend = {
          type: "move",
          data: move,
        };
        ws.current.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket not open. Cannot send move.");
      }
    },
    [ws.current],
  );

  const sendResignation = useCallback(() => {
    if (ws.current == null || ws.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not open. Cannot send resignation.");
      return;
    }

    const message: WebSocketMessageSend = {
      type: "resignation",
      data: {},
    };
    ws.current.send(JSON.stringify(message));
  }, [ws.current]);

  return {
    game,
    gameFen,
    currentTurn,
    sendMove,
    sendResignation,
    isConnected,
    clientPlayerColor,
    lastReceivedMove,
    hasStarted,
    hasEnded,
  };
}
