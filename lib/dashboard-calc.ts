import type { BlockType, Order } from "../types/order";
import { stType } from "./order-utils";

export type NvRow = {
  nv: string;
  dong: number;
  dan: number;
  tong: number;
  list: Order[];
};

export function calcKpi(dashOrders: Order[]) {
    
  let dong = 0;
  let dan = 0;

    const validOrders = dashOrders.filter(
    (o) => o.nv !== "CHƯA ĐÓNG"
    );

    validOrders.forEach((o) => {
    if (stType(o.status) === "dong") dong += o.so;
    if (stType(o.status) === "dan") dan += o.so;
    });

  return {
    dong,
    dan,
    tongNgay: dong + dan,
    tongMa: new Set(dashOrders.map((o) => o.ma)).size,
    tongNV: new Set(dashOrders.map((o) => o.nv)).size,
  };
}

export function calcNvRows(
    
  dashOrders: Order[],
  sortKey: "nv" | "dong" | "dan" | "tong",
  sortAsc: boolean
) {
    
  const map = new Map<string, NvRow>();

  dashOrders.forEach((o) => {
    if (o.nv === "CHƯA ĐÓNG") return;
    if (!map.has(o.nv)) {
      map.set(o.nv, {
        nv: o.nv,
        dong: 0,
        dan: 0,
        tong: 0,
        list: [],
      });
    }

    const item = map.get(o.nv)!;

    if (stType(o.status) === "dong") item.dong += o.so;
    if (stType(o.status) === "dan") item.dan += o.so;

    item.tong += o.so;
    item.list.push(o);
  });

  const rows = [...map.values()];

  rows.sort((a, b) => {
    const av = sortKey === "nv" ? a.nv : a[sortKey];
    const bv = sortKey === "nv" ? b.nv : b[sortKey];

    if (sortAsc) return av > bv ? 1 : -1;
    return av < bv ? 1 : -1;
  });

  return rows;
}

export function calcBlockChart(dashOrders: Order[]) {
  const bt: Record<BlockType, number> = {
    SPX: 0,
    "J&T": 0,
    KHÁC: 0,
  };

  dashOrders.forEach((o) => {
    bt[o.block] += o.so;
  });

  return bt;
}

export function calcProgressPct(dong: number, tongNgay: number) {
  return tongNgay ? Math.round((dong / tongNgay) * 100) : 0;
}