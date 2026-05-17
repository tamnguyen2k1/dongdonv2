import type { BlockType, Order, StatusType } from "@/types/order";

const NV_MAP = [
  { name: "HẢI", aliases: ["HAI"] },
  { name: "QUÝ", aliases: ["QUY"] },
  { name: "DŨNG", aliases: ["DUNG"] },
  { name: "HIỂN", aliases: ["HIEN"] },
  { name: "HUY", aliases: [] },
  { name: "LONG", aliases: [] },
  { name: "TÂN", aliases: ["TAN"] },
  { name: "THẮNG", aliases: ["THANG"] },

  { name: "V LUAN", aliases: ["V LUÂN", "V.LUAN", "V.LUÂN", "VAN LUAN", "VĂN LUÂN"] },
  { name: "T LUAN", aliases: ["T LUÂN", "T.LUAN", "T.LUÂN", "THANH LUAN", "THANH LUÂN"] },
];

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
  const aliasMatch = text.match(/\((.*?)\)/);
  const alias = aliasMatch ? norm(aliasMatch[1]) : null;

  for (const nv of NV_MAP) {
    if (raw.includes(norm(nv.name))) return nv.name;
    if (alias && nv.aliases.some((a) => norm(a) === alias)) return nv.name;
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
    const st = r[stI] || "";
    const nvData = splitNVAndNote(r[nvI]);

    const nv = nvData.nv;
    const note = nvData.note;
    const picker = r[pI] ? r[pI].toString().trim() : "";

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
export function splitNVAndNote(raw = "") {
  const txt = raw.trim();

  const patterns = [
    { regex: /^(v\s*\.?\s*lu[aâ]n|v[aă]n\s+lu[aâ]n)\b/i, value: "V LUAN" },
    { regex: /^(t\s*\.?\s*lu[aâ]n|thanh\s+lu[aâ]n)\b/i, value: "T LUAN" },

    { regex: /^(hải|hai)\b/i, value: "HẢI" },
    { regex: /^(quý|quy)\b/i, value: "QUÝ" },
    { regex: /^(dũng|dung)\b/i, value: "DŨNG" },
    { regex: /^(hiển|hien)\b/i, value: "HIỂN" },
    { regex: /^(huy)\b/i, value: "HUY" },
    { regex: /^(long)\b/i, value: "LONG" },
    { regex: /^(tân|tan)\b/i, value: "TÂN" },
    { regex: /^(thắng|thang)\b/i, value: "THẮNG" },
  ];

  for (const p of patterns) {
    const match = txt.match(p.regex);

    if (match) {
      const note = txt
        .slice(match[0].length)
        .replace(/^[-–—:|.\s]+/, "")
        .trim();

      return {
        nv: p.value,
        note,
      };
    }
  }

  return {
    nv: "CHƯA ĐÓNG",
    note: txt,
  };
}