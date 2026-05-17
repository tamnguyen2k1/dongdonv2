import { avLt, stType, statusClass } from "../lib/order-utils";
import type { Order } from "../types/order";

type Props = {
  orderRows: Order[];
  pagedOrders: Order[];
  orderPage: number;
  totalOrderPages: number;
  oPageSize: number;
  orderDong: number;
  orderDan: number;
  orderBlock: string;
  orderStatus: string;
  orderNV: string;
  orderSearch: string;
  allOrders: Order[];
  onBlockChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onNVChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onPageChange: (v: number) => void;
  onSort: (key: keyof Order) => void;
  onExport: () => void;
  statusSummary: {
    status: string;
    total: number;
    count: number;
}[];

onStatusClick: (status: string) => void;
};

export default function OrdersPage({
  orderRows,
  pagedOrders,
  orderPage,
  totalOrderPages,
  oPageSize,
  orderDong,
  orderDan,
  orderBlock,
  orderStatus,
  orderNV,
  orderSearch,
  allOrders,
  statusSummary,

  onBlockChange,
  onStatusChange,
  onNVChange,
  onSearchChange,
  onPageChange,
  onSort,
  onExport,
  onStatusClick,
}: Props) {
  const nvList = [...new Set(allOrders.map((o) => o.nv))].sort();

  return (
    <div className="page active">
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className="pt-icon"
              style={{ background: "rgba(6,182,212,.12)" }}
            >
              <i
                className="fa-solid fa-list-check"
                style={{ color: "var(--cyan)" }}
              />
            </div>

            <span className="pt">Danh Sách Đơn Hàng</span>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select
              className="ctrl"
              value={orderBlock}
              onChange={(e) => onBlockChange(e.target.value)}
            >
              <option value="">Tất cả Block</option>
              <option value="SPX">SPX</option>
              <option value="J&T">J&T</option>
              <option value="KHÁC">KHÁC</option>
            </select>

            <select
              className="ctrl"
              value={orderStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="">Tất cả TT</option>
              <option value="dong">Đóng</option>
              <option value="dan">Dán</option>
            </select>

            <select
              className="ctrl"
              value={orderNV}
              onChange={(e) => onNVChange(e.target.value)}
            >
              <option value="">Tất cả NV</option>

              {nvList.map((nv) => (
                <option key={nv}>{nv}</option>
              ))}
            </select>

            <div className="sw" style={{ minWidth: 160 }}>
              <i className="fa fa-magnifying-glass" />

              <input
                className="ctrl"
                placeholder="Tìm mã / picker..."
                style={{ borderRadius: 9 }}
                value={orderSearch}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <button className="btn-x btn-blue" onClick={onExport}>
              <i className="fa-solid fa-file-arrow-down" /> CSV
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <span>
            Đóng: <b style={{ color: "var(--green)" }}>{orderDong}</b>
          </span>

          <span>
            Dán: <b style={{ color: "var(--blue)" }}>{orderDan}</b>
          </span>

          <span>
            Tổng:{" "}
            <b style={{ color: "var(--purple)" }}>{orderRows.length}</b> đơn
          </span>

          <span style={{ marginLeft: "auto" }}>
            Trang {orderPage}/{totalOrderPages}
          </span>
        </div>
        <div className="status-summary">
            {statusSummary.map((s) => (
                <button
                key={s.status}
                className={`status-card ${statusClass(s.status)}`}
                onClick={() => onStatusClick(s.status)}
                type="button"
                >
                <span>{s.status}</span>

                <b>{s.total}</b>

                <small>{s.count} mã</small>
                </button>
            ))}
        </div>

        <div className="order-table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => onSort("ma")}>Mã Đơn</th>
                <th onClick={() => onSort("block")}>Block</th>
                <th onClick={() => onSort("nv")}>NV</th>
                <th>Picker</th>
                <th onClick={() => onSort("status")}>Trạng Thái</th>
                <th onClick={() => onSort("so")}>SL</th>
              </tr>
            </thead>

            <tbody>
              {pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <i className="fa-solid fa-magnifying-glass" />
                      Không tìm thấy đơn nào
                    </div>
                  </td>
                </tr>
              ) : (
                pagedOrders.map((o, i) => {
                  const t = stType(o.status);

                  const dotCls =
                    t === "dong"
                      ? "sd-dong"
                      : t === "dan"
                      ? "sd-dan"
                      : "sd-other";

                  const pillCls = statusClass(o.status);

                  return (
                    <tr key={`${o.ma}-${i}`}>
                      <td style={{ color: "var(--muted)", fontSize: 11 }}>
                        {(orderPage - 1) * oPageSize + i + 1}
                      </td>

                      <td
                        style={{
                            fontWeight: 700,
                            fontSize: 12,
                            maxWidth: 220,
                            wordBreak: "break-all",
                        }}
                        >
                        <div>{o.ma}</div>

                        {o.note && (
                            <div
                            style={{
                                fontSize: 11,
                                color: "var(--amber)",
                                marginTop: 4,
                                fontWeight: 700,
                            }}
                            >
                            📝 {o.note}
                            </div>
                        )}
                        </td>

                      <td>
                        <span className="pill p-p">{o.block}</span>
                      </td>

                      <td>
                        <div className="nvc">
                          <div
                            className="av"
                            style={{
                              width: 24,
                              height: 24,
                              fontSize: 9,
                            }}
                          >
                            {avLt(o.nv)}
                          </div>

                          <span style={{ fontWeight: 600, fontSize: 12 }}>
                            {o.nv}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{
                          color: "var(--purple)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {o.picker || "—"}
                      </td>

                      <td>
                        <span className={`pill ${pillCls}`}>
                          <span className={`status-dot ${dotCls}`} />
                          {o.status || "—"}
                        </span>
                      </td>

                      <td
                        style={{
                          fontFamily: "var(--font-d)",
                          fontSize: 18,
                          color: "var(--muted)",
                        }}
                      >
                        {o.so}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <span>{orderRows.length} đơn</span>

          <div>
            <button
              className="btn-sm"
              disabled={orderPage <= 1}
              onClick={() => onPageChange(orderPage - 1)}
            >
              Trước
            </button>

            <span style={{ margin: "0 8px" }}>
              {orderPage}/{totalOrderPages}
            </span>

            <button
              className="btn-sm"
              disabled={orderPage >= totalOrderPages}
              onClick={() => onPageChange(orderPage + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}