import type { Order } from "../types/order";
import { parseRows } from "./order-utils";
import type { SheetsData } from "../types/order";

export type PickerRow = {
  picker: string;
  total: number; // tổng đơn
  maCount: number; // tổng mã
  maSet: Set<string>;
  nvSet: Set<string>;
  list: Order[];
};

export function calcPickerRows(orders: Order[], pickerBlock: string) {
  const data = pickerBlock
    ? orders.filter((o) => o.block === pickerBlock)
    : orders;

  const map = new Map<string, PickerRow>();

  data.forEach((o) => {
    const p = o.picker || "(Không rõ)";

    if (!map.has(p)) {
      map.set(p, {
        picker: p,
        total: 0,
        maCount: 0,
        maSet: new Set(),
        nvSet: new Set(),
        list: [],
      });
    }

    const item = map.get(p)!;

    item.total += o.so;
    item.maSet.add(o.ma);
    item.maCount = item.maSet.size;
    item.nvSet.add(o.nv);
    item.list.push(o);
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function calcStatusSummary(rows: Order[]) {
  const map = new Map<string, { status: string; total: number; count: number }>();

  rows.forEach((o) => {
    const raw = (o.status || "").trim();

    if (
      !raw ||
      raw.toLowerCase() === "trạng thái" ||
      raw.toLowerCase() === "status"
    ) {
      return;
    }

    if (!map.has(raw)) {
      map.set(raw, {
        status: raw,
        total: 0,
        count: 0,
      });
    }

    const item = map.get(raw)!;
    item.total += o.so;
    item.count += 1;
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
}
export type PickerMonthDayRow = {
  ngay: string;
  total: number;
  maCount: number;
  maSet: Set<string>;
  list: Order[];
};

export type PickerMonthRow = PickerRow & {
  days: PickerMonthDayRow[];
};

export function calcPickerMonthRows(
  sheets: SheetsData,
  pickerBlock: string
): PickerMonthRow[] {
  const map = new Map<string, PickerMonthRow>();

  Object.entries(sheets).forEach(([sheetName, rows]) => {
    if (sheetName.trim().toUpperCase() === "MẪU") return;

    const orders = parseRows(rows);

    const data = pickerBlock
      ? orders.filter((o) => o.block === pickerBlock)
      : orders;

    data.forEach((o) => {
      const picker = o.picker || "(Không rõ)";

      if (!map.has(picker)) {
        map.set(picker, {
          picker,
          total: 0,
          maCount: 0,
          maSet: new Set(),
          nvSet: new Set(),
          list: [],
          days: [],
        });
      }

      const item = map.get(picker)!;

      item.total += o.so;
      item.maSet.add(o.ma);
      item.maCount = item.maSet.size;
      item.nvSet.add(o.nv);
      item.list.push(o);

      let day = item.days.find((d) => d.ngay === sheetName);

      if (!day) {
        day = {
          ngay: sheetName,
          total: 0,
          maCount: 0,
          maSet: new Set(),
          list: [],
        };

        item.days.push(day);
      }

      day.total += o.so;
      day.maSet.add(o.ma);
      day.maCount = day.maSet.size;
      day.list.push(o);
    });
  });

  return [...map.values()]
    .map((x) => ({
      ...x,
      days: x.days.sort((a, b) => a.ngay.localeCompare(b.ngay)),
    }))
    .sort((a, b) => b.total - a.total);
}