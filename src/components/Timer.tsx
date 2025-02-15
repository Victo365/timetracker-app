import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle } from 'lucide-react';

interface TimerProps {
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  isRunning: boolean;
}

export const Timer: React.FC<TimerProps> = ({ onStart, onPause, onStop, isRunning }) => {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="text-3xl font-mono">{formatTime(time)}</div>
      <div className="flex space-x-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
          >
            <Play size={24} />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Pause size={24} />
          </button>
        )}
        <button
          onClick={onStop}
          className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
        >
          <StopCircle size={24} />
        </button>
      </div>
    </div>
  );
};