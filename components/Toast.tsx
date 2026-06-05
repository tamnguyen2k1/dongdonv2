type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type Props = {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
};

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>
            {t.type === "success" && "✅"}
            {t.type === "error" && "❌"}
            {t.type === "info" && "🔔"}
          </span>

          <p>{t.message}</p>

          <button onClick={() => onRemove(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}