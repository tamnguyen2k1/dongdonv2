export type PageKey = "overview"| "dashboard" | "orders" | "picker"| "readyRate";
export type BlockType = "SPX" | "J&T" | "KHÁC";
export type StatusType = "dong" | "dan" | "other";

export type Order = {
  ma: string;
  block: BlockType;
  status: string;
  nv: string;
  picker: string;
  so: number;
  note?: string;
};

export type SheetsData = Record<string, string[][]>;