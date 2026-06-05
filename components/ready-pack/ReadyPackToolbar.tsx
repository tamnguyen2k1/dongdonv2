type StatMode = "detail" | "day" | "month";

type Props = {
  isAdmin: boolean;
  loading: boolean;
  keyword: string;
  statMode: StatMode;
  lastUpdate: string;
  onKeywordChange: (value: string) => void;
  onStatModeChange: (mode: StatMode) => void;
  onOpenKey: () => void;
  onLogout: () => void;
  onAddRate: () => void;
  onOpenProducts: () => void;
  onReload: () => void;
};

export default function ReadyPackToolbar({
  isAdmin,
  loading,
  keyword,
  statMode,
  lastUpdate,
  onKeywordChange,
  onStatModeChange,
  onOpenKey,
  onLogout,
  onAddRate,
  onOpenProducts,
  onReload,
}: Props) {
  return (
    <>
      <div className="rpr-head">
        <div>
          <h2>Tỷ lệ đóng sẵn</h2>
          <p>Cập nhật lúc {lastUpdate}</p>
        </div>

        <div className="rpr-actions">
          {!isAdmin && (
            <button className="rpr-btn primary" onClick={onOpenKey}>
              🔐 Nhập key
            </button>
          )}

          {isAdmin && (
            <>
              <button className="rpr-btn primary" onClick={onAddRate}>
                ＋ Thêm
              </button>

              <button className="rpr-btn ghost" onClick={onOpenProducts}>
                🧾 Mặt hàng
              </button>

              <button className="rpr-btn ghost" onClick={onLogout}>
                Thoát quyền
              </button>
            </>
          )}

          <button className="rpr-btn ghost" onClick={onReload}>
            {loading ? "Đang tải..." : "↻ Tải lại"}
          </button>
        </div>
      </div>

      <div className="rpr-tabs">
        <button
          className={statMode === "detail" ? "active" : ""}
          onClick={() => onStatModeChange("detail")}
        >
          Chi tiết
        </button>

        <button
          className={statMode === "day" ? "active" : ""}
          onClick={() => onStatModeChange("day")}
        >
          Theo ngày
        </button>

        <button
          className={statMode === "month" ? "active" : ""}
          onClick={() => onStatModeChange("month")}
        >
          Theo tháng
        </button>
      </div>

      <div className="rpr-filter">
        <input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Tìm nhân viên / mặt hàng / người tạo..."
        />
      </div>
    </>
  );
}