import { BLOCKS } from "../constants/warehouse";

type PageKey = "overview" |"dashboard" | "orders" | "picker";

type Props = {
  page: PageKey;
  sidebarCollapsed: boolean;
  ordersLength: number;
  blockFilter: string;
  onToggle: () => void;
  onPageChange: (p: PageKey) => void;
  onBlockFilter: (v: string) => void;
  onExport: () => void;
  mobileMenuOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
};

export default function Sidebar({
  page,
  sidebarCollapsed,
  ordersLength,
  blockFilter,
  mobileMenuOpen,
  onToggleMobile,
  onCloseMobile,
  onToggle,
  onPageChange,
  onBlockFilter,
  onExport,
}: Props) {
  return (
    <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
    mobileMenuOpen ? "mobile-open" : ""
  }`}>
      <div className="sidebar-logo">
        <div className="logo-icon">📦</div>
        <div className="logo-text">KHO ĐÓNG ĐƠN</div>
      </div>
      <button
          className="mobile-menu-btn"
          onClick={onToggleMobile}
          type="button"
        >
          <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`} />
      </button>

      <button
        className="sidebar-toggle"
        onClick={onToggle}
        type="button"
      >
        <i
          className={`fa ${
            sidebarCollapsed
              ? "fa-chevron-right"
              : "fa-chevron-left"
          }`}
        />
      </button>

      <div
        className="sidebar-menu"
        style={{
          overflowY: "auto",
          flex: 1,
          paddingBottom: 8,
        }}
      >
        <div className="nav-section">
          <div className="nav-label">Chính</div>
          <div
          className={`nav-item ${page === "overview" ? "active" : ""}`}
          onClick={() => {
            onPageChange("overview");
            onCloseMobile();
          }}
        >
          <div className="nav-icon">
            <i className="fa-solid fa-chart-pie" />
          </div>

          <span className="nav-text">Tổng Quan</span>
        </div>
          <div
            className={`nav-item ${
              page === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
                onPageChange("dashboard");
                onCloseMobile();
              }}
          >
            <div className="nav-icon">
              <i className="fa-solid fa-gauge-high" />
            </div>

            <span className="nav-text">Dashboard</span>

            <span className="nav-badge">LIVE</span>
          </div>

          <div
            className={`nav-item ${
              page === "orders" ? "active" : ""
            }`}
            onClick={() => {
              onPageChange("orders");
              onCloseMobile();
            }}
          >
            <div className="nav-icon">
              <i className="fa-solid fa-list-check" />
            </div>

            <span className="nav-text">Xem Đơn</span>

            <span className="nav-badge">{ordersLength}</span>
          </div>

          <div
            className={`nav-item ${
              page === "picker" ? "active" : ""
            }`}
             onClick={() => {
              onPageChange("picker");
              onCloseMobile();
            }}
          >
            <div className="nav-icon">
              <i className="fa-solid fa-chart-column" />
            </div>

            <span className="nav-text">Thống Kê Soạn</span>
          </div>
        </div>

        <div className="nav-section" style={{ marginTop: 8 }}>
          <div className="nav-label">Lọc nhanh</div>

          {BLOCKS.map((b) => (
            <div
              key={b}
              className={`nav-item ${
                blockFilter === b ? "active" : ""
              }`}
              onClick={() => {
                onBlockFilter(blockFilter === b ? "" : b);
                onPageChange("dashboard");
              }}
            >
              <div className="nav-icon">
                <i className="fa-solid fa-truck-fast" />
              </div>

              <span className="nav-text">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div
          className="nav-item"
          style={{ marginBottom: 0 }}
          onClick={onExport}
        >
          <div className="nav-icon">
            <i className="fa-solid fa-file-arrow-down" />
          </div>

          <span className="nav-text">Xuất CSV</span>
        </div>
      </div>
    </div>
  );
}