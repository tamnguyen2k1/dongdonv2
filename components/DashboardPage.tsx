import KpiBox from "./KpiBox";
import { avLt } from "../lib/order-utils";
import type { BlockType, Order } from "../types/order";

type NvRow = {
  nv: string;
  dong: number;
  dan: number;
  tong: number;
  list: Order[];
};

type Kpi = {
  dong: number;
  dan: number;
  tongNgay: number;
  tongMa: number;
  tongNV: number;
};

type Props = {
  kpi: Kpi;
  nvRows: NvRow[];
  blockChart: Record<BlockType, number>;
  blockFilter: string;
  statusFilter: string;
  searchInput: string;
  progressPct: number;
  maxTong: number;
  maxBlock: number;
  onBlockFilter: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSearch: (value: string) => void;
  onSort: (key: "nv" | "dong" | "dan" | "tong") => void;
  onOpenModal: (nv: string) => void;
};

export default function DashboardPage({
  kpi,
  nvRows,
  blockChart,
  blockFilter,
  statusFilter,
  searchInput,
  progressPct,
  maxTong,
  maxBlock,
  onBlockFilter,
  onStatusFilter,
  onSearch,
  onSort,
  onOpenModal,
}: Props) {
  return (
    <div className="page active">
      <div className="kpi-grid">
        <KpiBox
          color="var(--green)"
          icon="fa-box-archive"
          label="Đã Đóng"
          value={kpi.dong}
          sub="đơn hàng"
        />

        <KpiBox
          color="var(--blue)"
          icon="fa-tags"
          label="Đã Dán"
          value={kpi.dan}
          sub="đơn hàng"
        />

        <KpiBox
          color="var(--purple)"
          icon="fa-calculator"
          label="Tổng Ngày"
          value={kpi.tongNgay}
          sub="đóng + dán"
        />

        <KpiBox
          color="var(--amber)"
          icon="fa-barcode"
          label="Mã Đơn"
          value={kpi.tongMa}
          sub="mã duy nhất"
        />

        <KpiBox
          color="var(--cyan)"
          icon="fa-users"
          label="Nhân Viên"
          value={kpi.tongNV}
          sub="đang làm"
        />
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="ph">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="pt-icon"
                style={{ background: "rgba(59,130,246,.12)" }}
              >
                <i
                  className="fa-solid fa-table-list"
                  style={{ color: "var(--blue)" }}
                />
              </div>

              <span className="pt">Bảng Nhân Viên</span>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <select
                className="ctrl"
                value={blockFilter}
                onChange={(e) => onBlockFilter(e.target.value)}
              >
                <option value="">Tất cả Block</option>
                <option value="SPX">SPX</option>
                <option value="J&T">J&T</option>
                <option value="KHÁC">KHÁC</option>
              </select>

              <select
                className="ctrl"
                value={statusFilter}
                onChange={(e) => onStatusFilter(e.target.value)}
              >
                <option value="">Tất cả TT</option>
                <option value="dong">Đóng</option>
                <option value="dan">Dán</option>
              </select>

              <div className="sw">
                <i className="fa fa-magnifying-glass" />

                <input
                  className="ctrl"
                  placeholder="Tìm NV..."
                  style={{ borderRadius: 9 }}
                  value={searchInput}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th onClick={() => onSort("nv")}>
                    Nhân Viên{" "}
                    <i className="fa fa-sort" style={{ opacity: 0.3 }} />
                  </th>

                  <th onClick={() => onSort("dong")}>
                    Đóng <i className="fa fa-sort" style={{ opacity: 0.3 }} />
                  </th>

                  <th onClick={() => onSort("dan")}>
                    Dán <i className="fa fa-sort" style={{ opacity: 0.3 }} />
                  </th>

                  <th onClick={() => onSort("tong")}>
                    Tổng <i className="fa fa-sort" style={{ opacity: 0.3 }} />
                  </th>

                  <th>Tỷ lệ</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {nvRows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty">
                        <i className="fa-solid fa-box-open" />
                        Không có dữ liệu
                      </div>
                    </td>
                  </tr>
                ) : (
                  nvRows.map((x, i) => {
                    const pct = x.tong ? Math.round((x.dong / x.tong) * 100) : 0;
                    const bw = pct;
                    const rc =
                      i === 0 ? "r1" : i === 1 ? "r2" : i === 2 ? "r3" : "";

                    return (
                      <tr
                        key={x.nv}
                        className={rc}
                        style={{ animationDelay: `${i * 0.035}s` }}
                      >
                        <td
                          style={{
                            color: "var(--muted)",
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </td>

                        <td>
                          <div className="nvc">
                            <div className="av">{avLt(x.nv)}</div>

                            <div>
                              <div style={{ fontWeight: 700 }}>{x.nv}</div>

                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--muted)",
                                }}
                              >
                                {x.list.length} mã
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="pill p-g">{x.dong}</span>
                        </td>

                        <td>
                          <span className="pill p-b">{x.dan}</span>
                        </td>

                        <td
                          style={{
                            fontFamily: "var(--font-d)",
                            fontSize: 21,
                            color: "var(--blue)",
                          }}
                        >
                          {x.tong}
                        </td>

                        <td>
                          <div className="bw">
                            <div className="bb">
                              <div className="bf" style={{ width: `${bw}%` }} />
                            </div>

                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--muted)",
                                width: 28,
                                textAlign: "right",
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </td>

                        <td>
                          <button
                            className="btn-sm"
                            onClick={() => onOpenModal(x.nv)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-col">
          <div className="panel">
            <div className="ph">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="pt-icon"
                  style={{ background: "rgba(245,158,11,.12)" }}
                >
                  <i
                    className="fa-solid fa-trophy"
                    style={{ color: "var(--amber)" }}
                  />
                </div>

                <span className="pt">Top NV</span>
              </div>
            </div>

            {nvRows.slice(0, 5).map((x, i) => {
              const gc =
                i === 0 ? "g1" : i === 1 ? "g2" : i === 2 ? "g3" : "";

              return (
                <div className="ti" key={x.nv}>
                  <div className={`tr ${gc}`}>{i + 1}</div>

                  <div className="ti-info">
                    <div className="ti-name">{x.nv}</div>

                    <div className="ti-bar">
                      <div className="ti-bb">
                        <div
                          className="ti-bf"
                          style={{
                            width: `${Math.round((x.tong / maxTong) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="tc">{x.tong}</div>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="ph">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="pt-icon"
                  style={{ background: "rgba(168,85,247,.12)" }}
                >
                  <i
                    className="fa-solid fa-chart-pie"
                    style={{ color: "var(--purple)" }}
                  />
                </div>

                <span className="pt">Theo Block</span>
              </div>
            </div>

            <div style={{ padding: "5px 0" }}>
              {Object.entries(blockChart).map(([b, v]) => {
                const cls = b === "SPX" ? "spx" : b === "J&T" ? "jt" : "khac";

                return (
                  <div className="br" key={b}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        width: 48,
                        flexShrink: 0,
                      }}
                    >
                      {b}
                    </div>

                    <div className="bb2">
                      <div
                        className={`bf2 ${cls}`}
                        style={{
                          width: `${Math.round((v / maxBlock) * 100)}%`,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-d)",
                        fontSize: 17,
                        width: 36,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {v}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="ph">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="pt-icon"
                  style={{ background: "rgba(34,197,94,.12)" }}
                >
                  <i
                    className="fa-solid fa-circle-half-stroke"
                    style={{ color: "var(--green)" }}
                  />
                </div>

                <span className="pt">Tiến Độ</span>
              </div>

              <span
                style={{
                  fontFamily: "var(--font-d)",
                  fontSize: 20,
                  color: "var(--green)",
                }}
              >
                {progressPct}%
              </span>
            </div>

            <div className="prog-wrap">
              <div className="prog-bar-bg">
                <div
                  className="prog-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                <span>
                  <i
                    className="fa-solid fa-box-archive"
                    style={{ color: "var(--green)", marginRight: 3 }}
                  />
                  Đóng: <b style={{ color: "var(--green)" }}>{kpi.dong}</b>
                </span>

                <span>
                  <i
                    className="fa-solid fa-tags"
                    style={{ color: "var(--blue)", marginRight: 3 }}
                  />
                  Dán: <b style={{ color: "var(--blue)" }}>{kpi.dan}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}