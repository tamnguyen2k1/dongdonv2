import type { ReadyPackProduct } from "../../lib/ready-pack-product";

type Props = {
  isAdmin: boolean;
  products: ReadyPackProduct[];
  form: ReadyPackProduct;
  editingId: number | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: ReadyPackProduct) => void;
  onEdit: (product: ReadyPackProduct) => void;
  onRemove: (id?: number) => void;
  onReset: () => void;
};

export default function ReadyPackProductModal({
  isAdmin,
  products,
  form,
  editingId,
  onClose,
  onSubmit,
  onChange,
  onEdit,
  onRemove,
  onReset,
}: Props) {
  return (
    <div className="rpr-modal-bg" onClick={onClose}>
      <div
        className="rpr-modal rpr-product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="rpr-close" onClick={onClose}>
          ×
        </button>

        <h3>Quản lý mặt hàng</h3>

        {isAdmin && (
          <form className="rpr-product-form" onSubmit={onSubmit}>
            <Field label="Tên mặt hàng *">
              <input
                className={!form.ten_mat_hang ? "error" : ""}
                value={form.ten_mat_hang}
                onChange={(e) =>
                  onChange({
                    ...form,
                    ten_mat_hang: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Tên mặt hàng"
              />

              {!form.ten_mat_hang && (
                <em>Vui lòng nhập tên mặt hàng</em>
              )}
            </Field>

            <Field label="SKU">
              <input
                value={form.sku || ""}
                onChange={(e) =>
                  onChange({
                    ...form,
                    sku: e.target.value.toUpperCase(),
                  })
                }
                placeholder="VD: SKU001"
              />
            </Field>

            <Field label="Phân loại">
              <input
                value={form.phan_loai || ""}
                onChange={(e) =>
                  onChange({
                    ...form,
                    phan_loai: e.target.value.toUpperCase(),
                  })
                }
                placeholder="VD: 500G"
              />
            </Field>

            <div className="rpr-form-actions">
              <button
                type="button"
                className="rpr-btn ghost"
                onClick={onReset}
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rpr-btn primary"
              >
                {editingId ? "Cập nhật" : "Lưu"}
              </button>
            </div>
            <div className="rpr-product-switch">
            <span>TRẠNG THÁI</span>

            <label className="rpr-switch">
                <input
                type="checkbox"
                checked={form.is_active !== false}
                onChange={(e) =>
                    onChange({
                    ...form,
                    is_active: e.target.checked,
                    })
                }
                />

                <i />

                <b>
                {form.is_active !== false
                    ? "Đang hoạt động"
                    : "Tạm tắt"}
                </b>
            </label>
            </div>
          </form>
        )}

        <div className="rpr-table-wrap compact">
          <table className="rpr-table">
            <thead>
              <tr>
                <th>Tên mặt hàng</th>
                <th>SKU</th>
                <th>Phân loại</th>
                <th>Trạng thái</th>
                {isAdmin && <th>Thao tác</th>}
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={`product-${p.id}`}>
                  <td>
                    <strong>
                    {p.ten_mat_hang}

                    {p.phan_loai
                        ? ` - ${p.phan_loai}`
                        : ""}
                    </strong>
                  </td>

                  <td>
                    <span className="rpr-pill purple">
                      {p.sku || "CHƯA CÓ"}
                    </span>
                  </td>

                  <td>{p.phan_loai || "—"}</td>

                  <td>
                            <span
                            className={
                                p.is_active === false
                                ? "rpr-pill red"
                                : "rpr-pill green"
                            }
                            >
                            {p.is_active === false
                                ? "Tạm tắt"
                                : "Hoạt động"}
                            </span>
                  </td>

                  {isAdmin && (
                    <td>
                      <div className="rpr-row-actions">
                        <button onClick={() => onEdit(p)}>
                          Sửa
                        </button>

                        <button
                          onClick={() =>
                            onRemove(p.id)
                          }
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {!products.length && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4}>
                    <div className="rpr-empty">
                      Chưa có mặt hàng
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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