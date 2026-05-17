type Props = {
  color: string;
  icon: string;
  label: string;
  value: string | number;
  sub: string;
};

export default function KpiBox({
  color,
  icon,
  label,
  value,
  sub,
}: Props) {
  return (
    <div
      className="kpi"
      style={
        {
          "--kc": color,
          "--ki": color.replace(")", ",.12)").replace("var", "rgba"),
        } as React.CSSProperties
      }
    >
      <div className="kpi-icon">
        <i className={`fa-solid ${icon}`} style={{ color }} />
      </div>

      <div className="kpi-label">{label}</div>

      <div className="kpi-val">{value}</div>

      <div className="kpi-sub">{sub}</div>
    </div>
  );
}