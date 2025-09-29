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
    <div
      className={`card w-40 shadow-2xl rounded-2xl border border-base-300 transition-transform duration-300 ${isActive
          ? "bg-gradient-to-br from-emerald-500 to-green-600 scale-105"
          : "bg-gradient-to-br from-gray-700 to-gray-800 opacity-80"
        }`}
    >
      <div className="card-body p-4 items-center justify-center">
        <h2
          className={`text-5xl font-extrabold tracking-wider drop-shadow-lg ${isActive ? "text-white" : "text-gray-300"
            }`}
        >
          {formatTime(time)}
        </h2>
        <div
          className={`mt-2 h-1.5 w-full rounded-full overflow-hidden ${isActive ? "bg-white/30" : "bg-gray-600"
            }`}
        >
          <div
            className={`h-full transition-all duration-1000 ease-linear ${isActive ? "bg-white" : "bg-gray-400"
              }`}
            style={{
              width: `${Math.max((time / (counterTime / 1000)) * 100, 0)}%`,
            }}
          />
        </div>
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
      className={`flex flex-col justify-center gap-6 ${clientColor === "b" && "flex-col-reverse"
        }`}
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
