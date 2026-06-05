import { useState } from "react";
import StatCard from "./StatCard";
import type { Order } from "../types/order";
import type { PickerMonthRow } from "../lib/picker-calc";

type PickerRow = {
  picker: string;
  total: number;
  maCount: number;
  maSet: Set<string>;
  nvSet: Set<string>;
  list: Order[];
};

type Props = {
  pickerRows: PickerRow[];
  pickerMonthRows?: PickerMonthRow[];
  pickerBlock: string;
  pickerMonthLoading?: boolean;
  
  maxPicker: number;
  onPickerBlockChange: (v: string) => void;
};

export default function PickerPage({
  pickerRows,
  pickerMonthRows = [],
  pickerBlock,
  maxPicker,
  pickerMonthLoading = false,
  onPickerBlockChange,
}: Props) {
  const [mode, setMode] = useState<"day" | "month">("day");
  const [expandPicker, setExpandPicker] = useState("");

  const rows = mode === "month" ? pickerMonthRows : pickerRows;

  const totalOrders = rows.reduce((s, r) => s + r.total, 0);
  const totalCodes = rows.reduce((s, r) => s + r.maCount, 0);
  const maxValue = Math.max(...rows.map((r) => r.total), maxPicker, 1);

  return (
    <div className="page active">
      <div className="stat-grid">
        <StatCard color="var(--cyan)" label="Tổng Picker" value={rows.length} />
        <StatCard color="var(--blue)" label="Picker Top" value={rows[0]?.picker || "—"} small />
        <StatCard color="var(--green)" label={mode === "month" ? "Tổng Đơn Tháng" : "Tổng Đơn Soạn"} value={totalOrders} />
        <StatCard color="var(--amber)" label={mode === "month" ? "Tổng Mã Tháng" : "Tổng Mã Soạn"} value={totalCodes} />
      </div>

      <div className="panel">
        <div className="ph">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="pt-icon" style={{ background: "rgba(6,182,212,.12)" }}>
              <i className="fa-solid fa-chart-bar" style={{ color: "var(--cyan)" }} />
            </div>
            <span className="pt">
              {mode === "month" ? "Thống kê soạn theo tháng" : "Thống kê soạn theo ngày"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="ctrl"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as "day" | "month");
                setExpandPicker("");
              }}
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
            </select>

            <select
              className="ctrl"
              value={pickerBlock}
              onChange={(e) => onPickerBlockChange(e.target.value)}
            >
              <option value="">Tất cả Block</option>
              <option value="SPX">SPX</option>
              <option value="J&T">J&amp;T</option>
              <option value="KHÁC">KHÁC</option>
            </select>
          </div>
        </div>
                  {mode === "month" && pickerMonthLoading ? (
            <div className="loading-card">
              <span className="spin" />
              <b>Đang tải thống kê soạn tháng...</b>
              <small>Hệ thống đang đọc toàn bộ dữ liệu tháng</small>
            </div>
          ) : (
            <div className="soan-chart">
          {rows.length === 0 ? (
            <div className="empty">
              <i className="fa-solid fa-chart-bar" />
              Chưa có dữ liệu
            </div>
          ) : (
            rows.map((r) => {
              const percent = Math.round((r.total / maxValue) * 100);
              const isOpen = expandPicker === r.picker;

              return (
                <div className="picker-block" key={r.picker}>
                  <div
                    className="soan-row picker-click-row"
                    onClick={() => setExpandPicker(isOpen ? "" : r.picker)}
                  >
                    <div className="soan-name" title={r.picker}>
                      <i
                        className={`fa-solid ${isOpen ? "fa-chevron-down" : "fa-chevron-right"}`}
                        style={{ marginRight: 6, fontSize: 10 }}
                      />
                      {r.picker}
                    </div>

                    <div className="soan-bar-bg">
                      <div className="soan-bar-fill" style={{ width: `${percent}%` }}>
                        <span className="soan-bar-label">
                          {r.total} đơn / {r.maCount} mã
                        </span>
                      </div>
                    </div>

                    <div className="soan-total">{r.total}</div>
                  </div>

                  {isOpen && (
                    <div className="picker-detail-inline">
                      <div className="picker-detail-head">
                        <b>{r.picker}</b>
                        <span>
                          <b>{r.total} đơn</b>
                          <b>{r.maCount} mã</b>
                          {[...r.nvSet].map((nv) => (
                            <em className="picker-nv-pill" key={nv}>
                              {nv}
                            </em>
                          ))}
                        </span>
                      </div>

                      {mode === "month" && "days" in r ? (
                        <MonthDetail row={r as PickerMonthRow} />
                      ) : (
                        <DayDetail row={r} />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
           
          )}

        
      </div>
    </div>
  );
}

function DayDetail({ row }: { row: PickerRow }) {
  const maRows = [...row.maSet].map((ma) => {
    const rows = row.list.filter((x) => x.ma === ma);
    const total = rows.reduce((s, x) => s + x.so, 0);

    return { ma, total, rows };
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Đơn</th>
            <th>Block</th>
            <th>Trạng thái</th>
            <th>NV đóng</th>
          </tr>
        </thead>

        <tbody>
          {maRows.map((m) => (
            <tr key={m.ma}>
              <td style={{ fontWeight: 800 }}>{m.ma}</td>
              <td><span className="pill p-b">{m.total}</span></td>
              <td>{[...new Set(m.rows.map((x) => x.block))].join(", ")}</td>
              <td><StatusPills rows={m.rows} /></td>
              <td><NvPills rows={m.rows} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthDetail({ row }: { row: PickerMonthRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Đơn</th>
            <th>Mã</th>
            <th>Chi tiết mã</th>
          </tr>
        </thead>

        <tbody>
          {row.days.map((d) => (
            <tr key={d.ngay}>
              <td style={{ fontWeight: 800 }}>{d.ngay}</td>
              <td><span className="pill p-b">{d.total}</span></td>
              <td><span className="pill p-g">{d.maCount}</span></td>
              <td style={{ color: "var(--muted)", fontSize: 12 }}>
                {[...d.maSet].slice(0, 8).join(", ")}
                {d.maSet.size > 8 ? "..." : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPills({ rows }: { rows: Order[] }) {
  return (
    <>
      {[...new Set(rows.map((x) => x.status))].map((status) => {
        const s = (status || "").toLowerCase();
        let cls = "pill p-b";

        if (s.includes("đóng gói")) cls = "pill p-g";
        else if (s.includes("đã soạn")) cls = "pill p-c";
        else if (s.includes("đang soạn")) cls = "pill p-y";
        else if (s.includes("delay")) cls = "pill p-r";
        else if (s.includes("chờ sản xuất")) cls = "pill p-p";

        return (
          <span key={status} className={cls} style={{ marginRight: 4 }}>
            {status || "Chưa rõ"}
          </span>
        );
      })}
    </>
  );
}

function NvPills({ rows }: { rows: Order[] }) {
  return (
    <>
      {[...new Set(rows.map((x) => x.nv))].map((nv) => (
        <span key={nv} className="pill p-c" style={{ marginRight: 4 }}>
          {nv}
        </span>
      ))}
    </>
  );
}