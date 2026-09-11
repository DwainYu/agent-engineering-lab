import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  readStoredMode,
  ReadingModeContext,
  STORAGE_KEY,
  type ReadingMode,
} from "../../lib/reading";

/**
 * Mounted once by `Layout`. The choice is persisted because a reader who had to
 * switch it back on for every note would simply stop using it.
 */
export function ReadingModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ReadingMode>(readStoredMode);
  const toggle = useCallback(
    () => setMode((current) => (current === "assist" ? "en" : "assist")),
    [],
  );
  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, toggle]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage disabled — the toggle still works for this visit */
    }
  }, [mode]);

  return (
    <ReadingModeContext.Provider value={value}>{children}</ReadingModeContext.Provider>
  );
}
