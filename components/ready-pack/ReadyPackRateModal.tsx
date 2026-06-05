import type { ReadyPackRate } from "../../lib/ready-pack-rate";
import type { ReadyPackProduct } from "../../lib/ready-pack-product";

type Props = {
  form: ReadyPackRate;
  products: ReadyPackProduct[];
  editingId: number | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: ReadyPackRate) => void;
  saving?: boolean;
};

export default function ReadyPackRateModal({
  form,
  products,
  editingId,
  saving = false,
  onClose,
  onSubmit,
  onChange,
}: Props) {
  return (
    <div className="rpr-modal-bg" onClick={onClose}>
      <form
        className="rpr-modal"
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="rpr-close" onClick={onClose}>
          ×
        </button>

        <h3>{editingId ? "Sửa dữ liệu đóng sẵn" : "Thêm đóng sẵn"}</h3>

        <div className="rpr-rate-form">
          <Field label="Ngày">
            <input
              type="date"
              value={form.ngay}
              onChange={(e) => onChange({ ...form, ngay: e.target.value })}
            />
          </Field>

          <Field label="Người chuẩn bị">
            <input
              value={form.nhan_vien}
              onChange={(e) =>
                onChange({
                  ...form,
                  nhan_vien: e.target.value.toUpperCase(),
                })
              }
              placeholder="VD: LONG"
            />
          </Field>

          <Field label="Mặt hàng">
            <select
              value={form.mat_hang_id || ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                const product = products.find((p) => p.id === id);

                onChange({
                  ...form,
                  mat_hang_id: id || undefined,
                  mat_hang: `${product?.ten_mat_hang || ""}${
                    product?.phan_loai ? ` - ${product.phan_loai}` : ""
                  }`,
                });
              }}
            >
              <option value="">Chọn mặt hàng</option>

              {products
                .filter((p) => p.is_active !== false)
                .map((p) => (
                  <option key={`select-${p.id}`} value={p.id}>
                    {p.ten_mat_hang}
                    {p.phan_loai ? ` - ${p.phan_loai}` : ""}
                    {p.sku ? ` (${p.sku})` : ""}
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Nhu cầu">
            <input
              type="number"
              min={0}
              value={form.tong_don}
              onChange={(e) =>
                onChange({
                  ...form,
                  tong_don: Number(e.target.value),
                })
              }
              placeholder="Nhu cầu cần chuẩn bị"
            />
          </Field>

          <Field label="Đã đóng sẵn">
            <input
              type="number"
              min={0}
              value={form.don_san}
              onChange={(e) =>
                onChange({
                  ...form,
                  don_san: Number(e.target.value),
                })
              }
              placeholder="Số lượng đã đóng"
            />
          </Field>

          <Field label="Ghi chú">
            <input
              value={form.ghi_chu || ""}
              onChange={(e) =>
                onChange({
                  ...form,
                  ghi_chu: e.target.value,
                })
              }
              placeholder="VD: Ca sáng, đóng trước..."
            />
          </Field>
        </div>

        <div className="rpr-form-actions">
          <button type="button" className="rpr-btn ghost" onClick={onClose}>
            Hủy
          </button>

         <button type="submit" disabled={saving} className="rpr-btn primary">
           {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu"}
        </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="rpr-field">
      <span>{label}</span>
      {children}
    </label>
  );
}