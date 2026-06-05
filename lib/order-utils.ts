import type { BlockType, Order, StatusType } from "@/types/order";
import { EMPLOYEES } from "../constants/employees";

export function norm(t = "") {
  return t
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function cleanNV(text?: string) {
  if (!text) return null;

  const raw = norm(text);

  for (const emp of EMPLOYEES) {
    const keys = [emp.name, ...emp.aliases];

    for (const k of keys) {
      if (raw.includes(norm(k))) {
        return emp.name;
      }
    }
  }

  return null;
}

export function stType(s?: string): StatusType {
  const v = (s || "").toLowerCase();
  if (v.includes("đóng")) return "dong";
  if (v.includes("dán")) return "dan";
  return "other";
}

export function avLt(n: string) {
  return n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function parseRows(rows: string[][] = []) {
  const allOrders: Order[] = [];

  const proc = (
    r: string[],
    block: BlockType,
    maI: number,
    stI: number,
    pI: number,
    nvI: number
  ) => {
    const ma = r[maI];
        const maText = String(ma || "")
      .trim()
      .toUpperCase();

    if (
      maText === "MÃ PHIẾU SOẠN" ||
      maText === "MÃ ĐƠN" ||
      maText === "ORDER CODE"
    ) {
      return;
    }
    const rawStatus = String(r[stI] || "").trim();

    const st =
      rawStatus.toUpperCase() === "TRẠNG THÁI" ||
      rawStatus.toUpperCase() === "STATUS"
        ? ""
        : rawStatus;
    const nvData = splitNVAndNote(r[nvI]);

    const nv = nvData.nv;
    const note = nvData.note;
    const picker = r[pI] ? r[pI].toString().trim() : "";
    if (
      picker.toUpperCase() === "PICKER"
    ) {
      return;
    }
    const invalidStatus = [
      "",
      "TRẠNG THÁI",
      "STATUS",
      "-"
    ];

    if (invalidStatus.includes(st.toUpperCase())) {
      return;
    }
    if (
      ma?.toString().trim().toUpperCase() === "MÃ" ||
      ma?.toString().trim().toUpperCase() === "MA"
    ) {
      return;
    }
    if (!ma) return;

    ma.toString()
      .split("\n")
      .forEach((line) => {
        const text = line.trim();
        if (!text) return;

        const m = text.match(/-\s*(\d+)/);

        allOrders.push({
          ma: text,
          block,
          status: st,
          nv: nv || "CHƯA ĐÓNG",
          picker,
          so: m ? Number(m[1]) : 1,
          note
        });
      });
  };

  rows.forEach((r, i) => {
    if (i < 2) return;

    proc(r, "SPX", 0, 1, 2, 3);
    proc(r, "J&T", 5, 6, 7, 8);
    proc(r, "KHÁC", 10, 11, 12, 13);
  });

  return allOrders;
}
export function statusClass(status?: string) {
  const s = (status || "").toLowerCase();

  if (s.includes("đóng")) return "p-g";
  if (s.includes("dán")) return "p-b";
  if (s.includes("soạn")) return "p-soan";
  if (s.includes("delay")) return "p-delay";
  if (s.includes("sản xuất")) return "p-prod";
  if (s.includes("chờ")) return "p-wait";

  return "p-m";
}

function compactText(s: string) {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function removeCommonWords(s: string) {
  return s
    .replace(
      /(chua[w]? dong|chưa đóng|chua[w]? dan|chưa dán|delay|dang soan|đang soạn|soan hang|soạn hàng)/gi,
      ""
    )
    .replace(/^[-–—:|.\s]+/, "")
    .replace(/[-–—:|.\s]+$/, "")
    .trim();
}

export function splitNVAndNote(raw = "") {
  const text = String(raw || "").trim();
  const compact = compactText(text);

  for (const emp of EMPLOYEES) {
    const keys = [emp.name, ...emp.aliases];

    for (const key of keys) {
      const compactKey = compactText(key);

      if (!compactKey) continue;

      if (compact.includes(compactKey)) {
        const note = removeCommonWords(
          keys.reduce((current, k) => {
            const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return current.replace(new RegExp(escaped, "gi"), "");
          }, text)
        );

        return {
          nv: emp.name,
          note,
        };
      }
    }
  }

  return {
    nv: "CHƯA ĐÓNG",
    note: text,
  };
}