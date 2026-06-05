import type { SheetMonth } from "../lib/fetch-sheet";
type Props = {
  pageTitle: string;
notify?: (
  type: "success" | "error" | "info",
  message: string
) => void;
  month: string;
  onMonthChange: (value: string) => void;
  lastUpdate: string;
  isOk: boolean;
  sheetName: string;
  sheetNames: string[];
  months: SheetMonth[];
  onSheetChange: (name: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void};
  

function formatMonth(value: string) {
  const [year, month] = value.split("-");

  if (!year || !month) return value;

  return `Tháng ${month}/${year}`;
}
export default function Topbar({
  pageTitle,
  month,
  months = [],
  onMonthChange,
  lastUpdate,
  isOk,
  sheetName,
  sheetNames,
  theme,
  onToggleTheme,
  onSheetChange,
  notify,
}: Props) { { 
  return (
    
    <div className="topbar">
      <div className="topbar-left">
        <div className="page-title">{pageTitle}</div>
        <span className="badge-live">● LIVE</span>
      </div>

      <div className="topbar-right">
        <div className="last-update">{lastUpdate}</div>

        <div>
          {isOk ? (
  <i className="fa fa-circle-check" style={{ color: "var(--green)", fontSize: 14 }} />
) : (
  <i className="fa fa-circle-xmark" style={{ color: "var(--red)", fontSize: 14 }} />
)}
        </div>
            <select
                className="ctrl"
                value={month}
                onChange={(e) => {
                  const value = e.target.value;

                  if (
                    value &&
                    !/^\d{4}-\d{2}$/.test(value)
                  ) {
                    notify?.(
                      "error",
                      "Định dạng tháng không hợp lệ"
                    );
                    return;
                  }

                  onMonthChange(value);
                }}
              >
                <option value="">
                  Tháng hiện tại
                </option>

                {months.map((m) => (
                  <option
                    key={m.month}
                    value={m.valid ? m.month : ""}
                    disabled={m.valid === false}
                  >
                    {formatMonth(m.month)}
                    {!m.valid
                      ? " • Chưa cấu hình"
                      : m.active
                      ? " • Đang sử dụng"
                      : ""}
                  </option>
                ))}
              </select>

        <select
          className="ctrl"
          style={{ fontSize: 12 }}
          value={sheetName}
          onChange={(e) => onSheetChange(e.target.value)}
        >
          {sheetNames.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="theme-toggle" onClick={onToggleTheme} type="button">
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
        </button>
      </div>
    </div>
    
  );
}
}
