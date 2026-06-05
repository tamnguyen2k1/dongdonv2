import type { ReadyPackRate } from "../lib/ready-pack-rate";

export function calcRate(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

export function filterReadyPackRows(rows: ReadyPackRate[], keyword: string) {
  const kw = keyword.toLowerCase().trim();

  if (!kw) return rows;

  return rows.filter((x) => {
    return (
      x.nhan_vien.toLowerCase().includes(kw) ||
      (x.mat_hang || "").toLowerCase().includes(kw) ||
      (x.created_by || "").toLowerCase().includes(kw) ||
      (x.ghi_chu || "").toLowerCase().includes(kw)
    );
  });
}

export function getReadyPackKpi(rows: ReadyPackRate[]) {
  const tongDon = rows.reduce((s, x) => s + Number(x.tong_don || 0), 0);
  const donSan = rows.reduce((s, x) => s + Number(x.don_san || 0), 0);

  const matHangSet = new Set(rows.map((x) => x.mat_hang || "CHƯA CÓ"));

  return {
    tongDon,
    donSan,
    conThieu: tongDon - donSan,
    tyLe: calcRate(donSan, tongDon),
    tongMatHang: matHangSet.size,
  };
}

export function groupByDay(rows: ReadyPackRate[]) {
  const map = new Map<string, any>();

  rows.forEach((x) => {
    const key = `${x.ngay}|${x.nhan_vien}|${x.mat_hang}`;

    if (!map.has(key)) {
      map.set(key, {
        ngay: x.ngay,
        nhan_vien: x.nhan_vien,
        mat_hang: x.mat_hang || "—",
        tong_don: 0,
        don_san: 0,
        rows: [],
      });
    }

    const item = map.get(key);
    item.tong_don += Number(x.tong_don || 0);
    item.don_san += Number(x.don_san || 0);
    item.rows.push(x);
  });

  return [...map.values()].map((x) => ({
    ...x,
    con_thieu: x.tong_don - x.don_san,
    ty_le: calcRate(x.don_san, x.tong_don),
  }));
}

export function groupByMonth(rows: ReadyPackRate[]) {
  const map = new Map<string, any>();

  rows.forEach((x) => {
    const month = x.ngay.slice(0, 7);
    const key = `${month}|${x.nhan_vien}|${x.mat_hang}`;

    if (!map.has(key)) {
      map.set(key, {
        thang: month,
        nhan_vien: x.nhan_vien,
        mat_hang: x.mat_hang || "—",
        tong_don: 0,
        don_san: 0,
        rows: [],
      });
    }

    const item = map.get(key);
    item.tong_don += Number(x.tong_don || 0);
    item.don_san += Number(x.don_san || 0);
    item.rows.push(x);
  });

  return [...map.values()].map((x) => ({
    ...x,
    con_thieu: x.tong_don - x.don_san,
    ty_le: calcRate(x.don_san, x.tong_don),
  }));
}