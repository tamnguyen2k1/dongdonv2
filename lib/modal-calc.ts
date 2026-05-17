import type { Order } from "../types/order";
import { stType } from "./order-utils";

export function filterModalOrders({
  modalNV,
  dashOrders,
  modalSearch,
}: {
  modalNV: string | null;
  dashOrders: Order[];
  modalSearch: string;
}) {
  if (!modalNV) return [];

  return dashOrders
    .filter((o) => o.nv === modalNV)
    .filter((o) => {
      if (!modalSearch) return true;

      const kw = modalSearch.toLowerCase();

      return (
        o.ma.toLowerCase().includes(kw) ||
        (o.picker || "").toLowerCase().includes(kw)
      );
    });
}

export function calcModalStatusTotal(modalOrders: Order[]) {
  const dong = modalOrders
    .filter((o) => stType(o.status) === "dong")
    .reduce((s, o) => s + o.so, 0);

  const dan = modalOrders
    .filter((o) => stType(o.status) === "dan")
    .reduce((s, o) => s + o.so, 0);

  return { dong, dan };
}