import type { Order } from "../types/order";
import { stType } from "./order-utils";

export function filterOrderRows({
  orders,
  orderBlock,
  orderStatus,
  orderNV,
  orderSearch,
  orderSortKey,
  orderSortAsc,
}: {
  orders: Order[];
  orderBlock: string;
  orderStatus: string;
  orderNV: string;
  orderSearch: string;
  orderSortKey: keyof Order | "";
  orderSortAsc: boolean;
}) {
  let data = orders.filter((o) => {
    if (orderBlock && o.block !== orderBlock) return false;
    if (orderStatus && stType(o.status) !== orderStatus) return false;
    if (orderNV && o.nv !== orderNV) return false;

    if (
        orderSearch &&
        !`${o.ma} ${o.picker} ${o.status}`.toLowerCase().includes(orderSearch.toLowerCase())
        ) {
        return false;
        }

    return true;
  });

  if (orderSortKey) {
    data = [...data].sort((a, b) => {
      const av = a[orderSortKey] || "";
      const bv = b[orderSortKey] || "";

      if (orderSortAsc) return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }

  return data;
}

export function paginateOrders(
  rows: Order[],
  orderPage: number,
  pageSize: number
) {
  return rows.slice((orderPage - 1) * pageSize, orderPage * pageSize);
}

export function calcOrderStatusTotal(rows: Order[]) {
  const dong = rows
    .filter((o) => stType(o.status) === "dong")
    .reduce((s, o) => s + o.so, 0);

  const dan = rows
    .filter((o) => stType(o.status) === "dan")
    .reduce((s, o) => s + o.so, 0);

  return { dong, dan };
}
export function calcStatusSummary(rows: Order[]) {
  const map = new Map<
    string,
    { status: string; total: number; count: number }
  >();

  rows.forEach((o) => {
    const key = o.status || "Chưa rõ";

    if (!map.has(key)) {
      map.set(key, {
        status: key,
        total: 0,
        count: 0,
      });
    }

    const item = map.get(key)!;
    item.total += o.so;
    item.count += 1;
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
}