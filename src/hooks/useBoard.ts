import { useState, useRef } from "react";
import { Chess, type Move, type Square } from "chess.js";

export type MMove = { from: string; to: string };
export type PreHook = (move: MMove) => void;
export type PostHook = (move: Move) => void;

export function useBoard(onCheckMate?: () => void) {
  const [game, setGame] = useState(new Chess());

  const preHookFunctions = useRef<Map<string, PreHook>>(new Map());
  const postHookFunctions = useRef<Map<string, PostHook>>(new Map());

  function setGameFen(fen: string) {
    setGame(new Chess(fen));
  }

  function addPostHook(fn: PostHook, key: string | null = null) {
    if (!key) {
      postHookFunctions.current.set(
        preHookFunctions.current.size.toString(),
        fn,
      );
    } else {
      postHookFunctions.current.set(key, fn);
    }
  }

  function addPreHook(fn: PreHook, key: string | null = null) {
    if (!key) {
      preHookFunctions.current.set(
        preHookFunctions.current.size.toString(),
        fn,
      );
    } else {
      preHookFunctions.current.set(key, fn);
    }
  }

  function removePreHook(fn: (move: MMove) => void) {
    for (const [key, func] of preHookFunctions.current) {
      if (func === fn) {
        preHookFunctions.current.delete(key);
        break;
      }
    }
  }

  function removePostHook(fn: (move: MMove) => void) {
    for (const [key, func] of postHookFunctions.current) {
      if (func === fn) {
        postHookFunctions.current.delete(key);
        break;
      }
    }
  }

  type ResFunc = (move: Move) => void;

  function makeMove(move: MMove, resFunc?: ResFunc) {
    try {
      const moves = game.moves({ square: move.from as Square, verbose: true });

      if (moves.map((m) => m.to).includes(move.to as Square)) {
        for (const [key, fn] of preHookFunctions.current) {
          fn(move);
        }
      }

      const result = game.move(move);
      if (result) {
        if (resFunc == null) {
          setGame(new Chess(game.fen()));
        } else {
          resFunc(result);
        }
      }

      for (const [key, fn] of postHookFunctions.current) {
        fn(result);
      }

      if (game.isCheckmate() && onCheckMate != null) {
        onCheckMate();
      }
      return result;
    } catch (e) {
      return false;
    }
  }

  return {
    game,
    makeMove,
    addPreHook,
    addPostHook,
    removePostHook,
    removePreHook,
    setGameFen,
  };
}
