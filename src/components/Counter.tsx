import React, { useState, useEffect, useRef } from "react";

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

interface CounterProps {
  counterTime: number;
  increment: number;
  isActive: boolean;
  onTimeout: () => void;
}

function Counter({
  counterTime,
  increment,
  isActive,
  onTimeout,
}: CounterProps) {
  const [time, setTime] = useState(Math.floor(counterTime / 1000));
  const intervalId = useRef<number | null>(null);

  useEffect(() => {
    if (time === counterTime) return;

    setTime(Math.floor(counterTime / 1000));
  }, [counterTime]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    intervalId.current = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => {
      if (intervalId.current != null) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!increment) {
      return;
    }

    if (!isActive && time !== counterTime) {
      setTime((prevTime) => prevTime + Math.floor(increment / 1000));
    }
  }, [isActive]);

  useEffect(() => {
    if (time != 0) return;

    if (intervalId.current != null) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
    onTimeout();
  }, [time]);

  return (
    <div className="card w-32 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2
          className={`card-title justify-center text-5xl ${isActive ? "text-success" : "text-gray-500"}`}
        >
          {formatTime(time)}
        </h2>
      </div>
    </div>
  );
}

interface ChessTimersProps {
  increment: number;
  whiteTime: number;
  blackTime: number;
  onWhiteTimeout: () => void;
  onBlackTimeout: () => void;
  isWhiteTurn: boolean;
  clientColor: "w" | "b";
}

function ChessTimers({
  increment,
  whiteTime,
  blackTime,
  onWhiteTimeout,
  onBlackTimeout,
  isWhiteTurn,
  clientColor,
}: ChessTimersProps) {
  return (
    <div
      className={`flex flex-col justify-center gap-4 ${clientColor === "b" && "flex-col-reverse"}`}
    >
      <Counter
        counterTime={whiteTime}
        increment={increment}
        isActive={!isWhiteTurn}
        onTimeout={onBlackTimeout}
      />
      <Counter
        counterTime={blackTime}
        increment={increment}
        isActive={isWhiteTurn}
        onTimeout={onWhiteTimeout}
      />
    </div>
  );
}

export default ChessTimers;
