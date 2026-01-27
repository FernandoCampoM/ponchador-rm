"use client";

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set the initial time on the client
    setTime(new Date());

    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!time) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[148px]">
        <div className="text-8xl md:text-9xl font-bold text-primary tabular-nums">
          --:--:-- --
        </div>
        <div className="text-xl md:text-2xl text-muted-foreground mt-2">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center h-[110px] md:h-[148px]">
  <div className="text-6xl md:text-9xl font-bold text-primary tabular-nums">
    {formatTime(time)}
  </div>
  <div className="text-lg md:text-2xl text-muted-foreground mt-1 md:mt-2">
    {formatDate(time)}
  </div>
</div>

  );
}
