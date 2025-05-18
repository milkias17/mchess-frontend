import React, { useState, useEffect, useRef } from 'react';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

interface CounterProps {
  initialTime: number;
  increment: number;
  isActive: boolean;
  onTimeout: () => void;
}

function Counter({ initialTime, increment, isActive, onTimeout }: CounterProps) {
  const [time, setTime] = useState(initialTime);
  const intervalId = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    intervalId.current = setInterval(() => {
      setTime(prevTime => prevTime - 1);
    }, 1000)

    return () => {
      if (intervalId.current != null) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [isActive, onTimeout]);

  useEffect(() => {
    if (!increment) {
      return;
    }

    if (!isActive && time !== initialTime) {
      setTime(prevTime => prevTime + increment);
    }

  }, [isActive])

  useEffect(() => {
    if (time != 0) return;

    if (intervalId.current != null) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
    onTimeout();
  }, [time])

  return (
    <div className="card w-32 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className={`card-title justify-center text-5xl ${isActive ? 'text-success' : 'text-gray-500'}`}>{formatTime(time)}</h2>
      </div>
    </div>
  );
}

interface ChessTimersProps {
  timeFormat: string | null;
  onWhiteTimeout: () => void;
  onBlackTimeout: () => void;
  isWhiteTurn: boolean;
}

function getTimeAndIncrement(timeFormat: string) {
  const splitted = timeFormat.split("+")
  if (splitted.length != 2) {
    throw new Error("Invalid time format");
  }

  return {
    time: 60 * Number(splitted[0]),
    increment: Number(splitted[1])
  }
}

function ChessTimers({timeFormat, onWhiteTimeout, onBlackTimeout, isWhiteTurn }: ChessTimersProps) {
  const timeIncrement = useRef(timeFormat == null ? {
    time: 10,
    increment: 0
  } : getTimeAndIncrement(timeFormat))

  return (
    <div className="flex flex-col justify-center gap-4">
      <Counter
        initialTime={timeIncrement.current.time}
        increment={timeIncrement.current.increment}
        isActive={!isWhiteTurn}
        onTimeout={onBlackTimeout}
      />
      <Counter
        initialTime={timeIncrement.current.time}
        increment={timeIncrement.current.increment}
        isActive={isWhiteTurn}
        onTimeout={onWhiteTimeout}
      />
    </div>
  );
}

export default ChessTimers;
