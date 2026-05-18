import { parseRows, stType } from "./order-utils";
import type { SheetsData } from "../types/order";

export function calcOverview(sheets: SheetsData) {
  const allOrders = Object.values(sheets).flatMap((rows) => parseRows(rows));

  const totalOrders = allOrders.reduce((s, o) => s + o.so, 0);
  const totalCodes = new Set(allOrders.map((o) => o.ma)).size;

  const validOrders = allOrders.filter((o) => o.nv !== "CHƯA ĐÓNG");

  const totalEmployees = new Set(validOrders.map((o) => o.nv)).size;

  const totalDone = allOrders
    .filter((o) => stType(o.status) === "dong")
    .reduce((s, o) => s + o.so, 0);

  const totalLabel = allOrders
    .filter((o) => stType(o.status) === "dan")
    .reduce((s, o) => s + o.so, 0);
   const totalPending = allOrders
  .filter((o) => (o.status || "").toLowerCase().includes("chưa đóng"))
  .reduce((s, o) => s + o.so, 0);

  const statusMap = new Map<
    string,
    { status: string; total: number; count: number }
  >();

  allOrders.forEach((o) => {
    const key = o.status || "KHÁC";

    if (!statusMap.has(key)) {
      statusMap.set(key, {
        status: key,
        total: 0,
        count: 0,
      });
    }

    const item = statusMap.get(key)!;
    item.total += o.so;
    item.count += 1;
  });

  const statusSummary = [...statusMap.values()].sort(
    (a, b) => b.total - a.total
  );

  const sheetSummary = Object.entries(sheets)
    .map(([sheet, rows]) => {
      const data = parseRows(rows);

      return {  
        sheet,
        total: data.reduce((s, o) => s + o.so, 0),
        codes: new Set(data.map((o) => o.ma)).size,
        done: data
          .filter((o) => stType(o.status) === "dong")
          .reduce((s, o) => s + o.so, 0),
        label: data
          .filter((o) => stType(o.status) === "dan")
          .reduce((s, o) => s + o.so, 0),
        pending: data
        .filter((o) => (o.status || "").toLowerCase().includes("chưa đóng"))
        .reduce((s, o) => s + o.so, 0),
      };
    })
    .sort((a, b) => b.sheet.localeCompare(a.sheet));

  const empMap = new Map<
    string,
    { nv: string; total: number; done: number; label: number }
  >();

  validOrders.forEach((o) => {
    if (!empMap.has(o.nv)) {
      empMap.set(o.nv, {
        nv: o.nv,
        total: 0,
        done: 0,
        label: 0,
      });
    }

    const item = empMap.get(o.nv)!;
    item.total += o.so;

    if (stType(o.status) === "dong") item.done += o.so;
    if (stType(o.status) === "dan") item.label += o.so;
  });

  const employeeSummary = [...empMap.values()].sort(
    (a, b) => b.total - a.total
  );

  return {
    totalOrders,
    totalCodes,
    totalEmployees,
    totalDone,
    totalLabel,
    totalPending,
    statusSummary,
    sheetSummary,
    employeeSummary,
  };
}