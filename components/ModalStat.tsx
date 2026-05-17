type Props = {
  label: string;
  value: string | number;
  color?: string;
};

export default function ModalStat({
  label,
  value,
  color = "var(--blue)",
}: Props) {
  return (
    <div className="msc">
      <div className="mv" style={{ color }}>
        {value}
      </div>

      <div className="ml">{label}</div>
    </div>
  );
}