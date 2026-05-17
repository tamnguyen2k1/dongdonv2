import type { SheetsData } from "../types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchSheetData(): Promise<SheetsData> {
  const res = await fetch(`${API_URL}?t=${Date.now()}`);

  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }

  return res.json();
}