import { useEffect, useState } from "react";

const useElapsedTime = (startedAt: string | undefined, isRunning: boolean) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt || !isRunning) return;

    const startMs = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Date.now() - startMs));

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, isRunning]);

  return elapsed;
};

export { useElapsedTime };
