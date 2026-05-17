type Props = {
  color: string;
  label: string;
  value: string | number;
  small?: boolean;
};

export default function StatCard({
  color,
  label,
  value,
  small,
}: Props) {
  return (
    <div
      className="stat-card"
      style={{ "--sc": color } as React.CSSProperties}
    >
      <div className="lbl">{label}</div>

      <div
        className="val"
        style={{
          color,
          fontSize: small ? 18 : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}