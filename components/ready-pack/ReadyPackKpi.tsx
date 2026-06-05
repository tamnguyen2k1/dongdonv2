type Props = {
  kpi: {
    tongDon: number;
    donSan: number;
    conThieu: number;
    tyLe: number;
    tongMatHang: number;
  };
};

export default function ReadyPackKpi({ kpi }: Props) {
  return (
    <div className="rpr-kpi-grid">
      <Kpi icon="📋" label="Nhu cầu" value={kpi.tongDon} color="blue" />
      <Kpi icon="📦" label="Đã đóng sẵn" value={kpi.donSan} color="green" />
      <Kpi icon="⚠️" label="Còn thiếu" value={kpi.conThieu} color="orange" />
      <Kpi icon="%" label="Đáp ứng" value={`${kpi.tyLe}%`} color="purple" />
      <Kpi icon="🛍️" label="Mặt hàng" value={kpi.tongMatHang} color="cyan" />
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rpr-kpi">
      <div className={`rpr-kpi-icon ${color}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}