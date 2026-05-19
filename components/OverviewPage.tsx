import KpiBox from "./KpiBox";
import { statusClass } from "../lib/order-utils";

type StatusSummary = {
  status: string;
  total: number;
  count: number;
};

type SheetSummary = {
  sheet: string;
  total: number;
  codes: number;
  done: number;
  label: number;
  pending: number;
};

type EmployeeSummary = {
  nv: string;
  total: number;
  done: number;
  label: number;
};

type Props = {
  totalOrders: number;
  totalCodes: number;
  totalEmployees: number;
  totalDone: number;
  totalLabel: number;
  totalPending: number;
  statusSummary: StatusSummary[];
  sheetSummary: SheetSummary[];
  employeeSummary: EmployeeSummary[];
};

export default function OverviewPage({
  totalOrders,
  totalCodes,
  totalEmployees,
  totalDone,
  totalLabel,
  totalPending,
  statusSummary,
  sheetSummary,
  employeeSummary,
}: Props) {
  return (
    <div className="page active">
      <div className="kpi-grid">
        <KpiBox color="var(--purple)" icon="fa-layer-group" label="Tổng Tất Cả Sheet" value={totalOrders} sub="tất cả đơn" />
        <KpiBox color="var(--amber)" icon="fa-barcode" label="Tổng Mã" value={totalCodes} sub="mã duy nhất" />
        <KpiBox color="var(--cyan)" icon="fa-users" label="Nhân Viên" value={totalEmployees} sub="đã có tên" />
        <KpiBox color="var(--green)" icon="fa-box-archive" label="Đã Đóng" value={totalDone} sub="đơn hàng" />
        <KpiBox color="var(--blue)" icon="fa-tags" label="Đã Dán" value={totalLabel} sub="đơn hàng" />
        <KpiBox color="var(--red)" icon="fa-circle-exclamation" label="Chưa Đóng" value={totalPending} sub="chưa có NV" />
      </div>

        <div className="panel">
          <div className="ph">
            <span className="pt">Tổng Quan Trạng Thái</span>
          </div>

          <div className="status-summary">
            {statusSummary.map((s) => (
              <div key={s.status} className={`status-card ${statusClass(s.status)}`}>
                <span>{s.status}</span>
                <b>{s.total}</b>
                <small>{s.count} mã</small>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="ph">
            <span className="pt">Top Nhân Viên</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>NV</th>
                  <th>Tổng</th>
                  <th>Đóng</th>
                  <th>Dán</th>
                </tr>
              </thead>
              <tbody>
                {employeeSummary.map((e, i) => (
                  <tr key={e.nv}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 800 }}>{e.nv}</td>
                    <td style={{ fontFamily: "var(--font-d)", fontSize: 20, color: "var(--blue)" }}>{e.total}</td>
                    <td><span className="pill p-g">{e.done}</span></td>
                    <td><span className="pill p-b">{e.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="ph">
          <span className="pt">Theo Từng Sheet / Ngày</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Sheet</th>
                <th>Tổng</th>
                <th>Mã</th>
                <th>Đóng</th>
                <th>Dán</th>
                <th>Chưa đóng</th>
              </tr>
            </thead>

            <tbody>
              {sheetSummary.map((s) => (
                <tr key={s.sheet}>
                  <td style={{ fontWeight: 800 }}>{s.sheet}</td>
                  <td>{s.total}</td>
                  <td>{s.codes}</td>
                  <td><span className="pill p-g">{s.done}</span></td>
                  <td><span className="pill p-b">{s.label}</span></td>
                  <td><span className="pill p-wait">{s.pending}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}