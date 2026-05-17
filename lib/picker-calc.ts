import type { Order } from "../types/order";

export type PickerRow = {
  picker: string;
  total: number;
  nvSet: Set<string>;
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
        nvSet: new Set(),
      });
    }

    const item = map.get(p)!;
    item.total += o.so;
    item.nvSet.add(o.nv);
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
}