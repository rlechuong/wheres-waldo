import { useEffect, useState } from "react";

const useTransientFlag = (trigger: unknown, durationMs = 2000) => {
  const [expiredTrigger, setExpiredTrigger] = useState<unknown>(undefined);

  useEffect(() => {
    if (trigger === undefined) return;
    const id = setTimeout(() => setExpiredTrigger(trigger), durationMs);
    return () => clearTimeout(id);
  }, [trigger, durationMs]);

  return trigger !== undefined && trigger !== expiredTrigger;
};

export { useTransientFlag };
