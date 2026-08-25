import { AppData } from "./types";

const STORAGE_KEY = "masrofy-data-v1";

export function loadData(): Partial<AppData> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* best effort — e.g. storage disabled or full */
  }
}
