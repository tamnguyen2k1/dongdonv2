import StatCard from "./StatCard";
import type { BlockType } from "../types/order";

type PickerRow = {
  picker: string;
  total: number;
  nvSet: Set<string>;
};

type Props = {
  pickerRows: PickerRow[];
  pickerBlock: string;
  maxPicker: number;
  onPickerBlockChange: (v: string) => void;
};

export default function PickerPage({
  pickerRows,
  pickerBlock,
  maxPicker,
  onPickerBlockChange,
}: Props) {
  const totalOrders = pickerRows.reduce((s, r) => s + r.total, 0);
  const avg = pickerRows.length ? Math.round(totalOrders / pickerRows.length) : 0;

  return (
    <div className="page active">
      <div className="stat-grid">
        <StatCard color="var(--cyan)" label="Tổng Picker" value={pickerRows.length} />

        <StatCard
          color="var(--blue)"
          label="Picker Top"
          value={pickerRows[0]?.picker || "—"}
          small
        />

        <StatCard color="var(--green)" label="Tổng Đơn Soạn" value={totalOrders} />

        <StatCard color="var(--amber)" label="TB / Picker" value={avg} />
      </div>

      <div className="two-col" style={{ gap: 16 }}>
        <div className="panel">
          <div className="ph">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="pt-icon"
                style={{ background: "rgba(6,182,212,.12)" }}
              >
                <i
                  className="fa-solid fa-chart-bar"
                  style={{ color: "var(--cyan)" }}
                />
              </div>

              <span className="pt">Đơn Theo Picker</span>
            </div>

            <select
              className="ctrl"
              value={pickerBlock}
              onChange={(e) => onPickerBlockChange(e.target.value)}
            >
              <option value="">Tất cả Block</option>
              <option value={"SPX" satisfies BlockType}>SPX</option>
              <option value={"J&T" satisfies BlockType}>J&T</option>
              <option value={"KHÁC" satisfies BlockType}>KHÁC</option>
            </select>
          </div>

          <div className="soan-chart">
            {pickerRows.length === 0 ? (
              <div className="empty">
                <i className="fa-solid fa-chart-bar" />
                Chưa có dữ liệu
              </div>
            ) : (
              pickerRows.map((r) => (
                <div className="soan-row" key={r.picker}>
                  <div className="soan-name" title={r.picker}>
                    {r.picker}
                  </div>

                  <div className="soan-bar-bg">
                    <div
                      className="soan-bar-fill"
                      style={{
                        width: `${Math.round((r.total / maxPicker) * 100)}%`,
                      }}
                    >
                      <span className="soan-bar-label">{r.total}</span>
                    </div>
                  </div>

                  <div className="soan-total">{r.total}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel picker-table">
          <div className="ph">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="pt-icon"
                style={{ background: "rgba(168,85,247,.12)" }}
              >
                <i
                  className="fa-solid fa-table"
                  style={{ color: "var(--purple)" }}
                />
              </div>

              <span className="pt">Chi Tiết</span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Picker</th>
                  <th>Đơn</th>
                  <th>NV Đóng</th>
                </tr>
              </thead>

              <tbody>
                {pickerRows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty" style={{ padding: 24 }}>
                        <i className="fa-solid fa-table" />
                        Chưa có
                      </div>
                    </td>
                  </tr>
                ) : (
                  pickerRows.map((r, i) => (
                    <tr key={r.picker}>
                      <td style={{ color: "var(--muted)", fontSize: 11 }}>
                        {i + 1}
                      </td>

                      <td style={{ fontWeight: 700, color: "var(--cyan)" }}>
                        {r.picker}
                      </td>

                      <td>
                        <span className="pill p-b">{r.total}</span>
                      </td>

                      <td style={{ fontSize: 11, color: "var(--muted)" }}>
                        {[...r.nvSet].join(", ")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}