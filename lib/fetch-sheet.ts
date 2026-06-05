import type { SheetsData } from "../types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export type SheetMonth = {
  month: string;
  active: boolean;
  valid: boolean;
};
export type MonthHashResponse = {
  hash: string;
  sheets: number;
  checkedAt: string;
};
export async function fetchMonthHash(
  month?: string
): Promise<MonthHashResponse> {
  const params = new URLSearchParams();

  params.set("action", "monthHash");

  if (month) {
    params.set("month", month);
  }

  const res = await fetch(api(params), {
    cache: "no-store",
  });

  const json = await res.json();

  if (json.error) {
    throw new Error(json.message);
  }

  return json as MonthHashResponse;
}
function api(params: URLSearchParams) {
  if (!API_URL) throw new Error("Thiếu NEXT_PUBLIC_API_URL");
  params.set("t", Date.now().toString());
  return `${API_URL}?${params.toString()}`;
}

export async function fetchSheetMonths(): Promise<SheetMonth[]> {
  const params = new URLSearchParams();
  params.set("action", "months");

  const res = await fetch(api(params), { cache: "no-store" });
  const json = await res.json();

  if (json.error) throw new Error(json.message);

  return Array.isArray(json) ? json : [];
}

export async function fetchSheetNames(month?: string): Promise<string[]> {
  const params = new URLSearchParams();
  params.set("action", "sheetNames");

  if (month) params.set("month", month);

  const res = await fetch(api(params), { cache: "no-store" });
  const json = await res.json();

  if (json.error) throw new Error(json.message);

  return Array.isArray(json) ? json : [];
}

export async function fetchSheetData(
  month?: string,
  sheetName?: string
): Promise<SheetsData> {
  const params = new URLSearchParams();

  if (month) params.set("month", month);
  if (sheetName) params.set("sheet", sheetName);

  const res = await fetch(api(params), { cache: "no-store" });
  const json = await res.json();

  if (json.error) throw new Error(json.message);

  return json as SheetsData;
}
export async function fetchMonthData(
  month?: string
): Promise<SheetsData> {
  const params = new URLSearchParams();

  params.set("scope", "month");

  if (month) {
    params.set("month", month);
  }

  const res = await fetch(api(params), {
    cache: "no-store",
  });

  const json = await res.json();

  if (json.error) {
    throw new Error(json.message);
  }

  return json as SheetsData;
}