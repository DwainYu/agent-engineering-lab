import { createContext, useContext } from "react";

/**
 * Reading mode is not a locale switch. English is always the content; `assist`
 * only decides whether the Chinese assistance blocks already present in the
 * Markdown are revealed. Default is English, so the site stays English-first for
 * every visitor, including the author on a normal day.
 */
export type ReadingMode = "en" | "assist";

export const STORAGE_KEY = "lab-reading-mode";

export interface ReadingModeState {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  toggle: () => void;
}

export const ReadingModeContext = createContext<ReadingModeState | null>(null);

export function useReadingMode(): ReadingModeState {
  const value = useContext(ReadingModeContext);
  if (!value) {
    throw new Error("useReadingMode must be used inside <ReadingModeProvider>");
  }
  return value;
}

/** A broken or missing preference must never decide the default: English. */
export function readStoredMode(): ReadingMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "assist" ? "assist" : "en";
  } catch {
    return "en";
  }
}
