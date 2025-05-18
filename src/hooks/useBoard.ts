import { useState, useRef } from "react";
import { Chess, Move, type Square } from "chess.js";

export type MMove = { from: string; to: string };

export function useBoard() {
  const [game, setGame] = useState(new Chess());
  const preHookFunctions = useRef<((move: MMove) => void)[]>([]);
  const postHookFunctions = useRef<((move: MMove) => void)[]>([]);

  function addPostHook(fn: (move: MMove) => void) {
    postHookFunctions.current = [...postHookFunctions.current, fn];
  }

  function addPreHook(fn: (move: MMove) => void) {
    preHookFunctions.current = [...preHookFunctions.current, fn];
  }

  function removePreHook(fn: (move: MMove) => void) {
    preHookFunctions.current = preHookFunctions.current.filter(
      (preFn) => preFn !== fn,
    );
  }

  function removePostHook(fn: (move: MMove) => void) {
    postHookFunctions.current = postHookFunctions.current.filter(
      (postFn) => postFn !== fn,
    );
  }

  function makeMove(move: MMove) {
    try {
      const moves = game.moves({ square: move.from as Square, verbose: true });

      if (moves.map((m) => m.to).includes(move.to as Square)) {
        for (const fn of preHookFunctions.current) {
          fn(move);
        }
      }

      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
      }

      for (const fn of postHookFunctions.current) {
        fn(move);
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
  };
}
