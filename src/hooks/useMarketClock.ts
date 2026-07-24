import { useState, useEffect } from 'react';

export interface ClockTime {
  hours: string;
  minutes: string;
  seconds: string;
  utc: string;
  session: string;
  date: string;
}

export function useMarketClock(): ClockTime {
  const [time, setTime] = useState<ClockTime>(getTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function getTime(): ClockTime {
  const now = new Date();
  const utcHour = now.getUTCHours();

  let session = 'SYDNEY';
  if (utcHour >= 0 && utcHour < 7) session = 'TOKYO';
  else if (utcHour >= 7 && utcHour < 13) session = 'LONDON';
  else if (utcHour >= 13 && utcHour < 22) session = 'NEW YORK';

  return {
    hours: pad(now.getHours()),
    minutes: pad(now.getMinutes()),
    seconds: pad(now.getSeconds()),
    utc: `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())} UTC`,
    session,
    date: now.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
