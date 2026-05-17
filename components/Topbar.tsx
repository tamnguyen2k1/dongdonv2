type Props = {
  pageTitle: string;
  lastUpdate: string;
  isOk: boolean;
  sheetName: string;
  sheetNames: string[];
  onSheetChange: (name: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export default function Topbar({
  pageTitle,
  lastUpdate,
  isOk,
  sheetName,
  sheetNames,
  theme,
    onToggleTheme,
  onSheetChange,
}: Props) {
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
            <i
              className="fa fa-circle-check"
              style={{ color: "var(--green)", fontSize: 14 }}
            />
          ) : (
            <span className="spin" />
          )}
        </div>

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