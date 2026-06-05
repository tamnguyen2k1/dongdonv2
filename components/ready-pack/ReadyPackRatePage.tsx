"use client";

import { useMemo, useState, useEffect } from "react";

import {
  createReadyPackRate,
  deleteReadyPackRate,
  updateReadyPackRate,
  type ReadyPackRate,
} from "../../lib/ready-pack-rate";

import {
  createReadyPackProduct,
  deleteReadyPackProduct,
  updateReadyPackProduct,
  type ReadyPackProduct,
} from "../../lib/ready-pack-product";

import { useReadyPackData } from "../../hooks/useReadyPackData";

import {
  filterReadyPackRows,
  getReadyPackKpi,
  groupByDay,
  groupByMonth,
} from "../../utils/ready-pack-calc";

import ReadyPackKpi from "./ReadyPackKpi";
import ReadyPackToolbar from "./ReadyPackToolbar";
import ReadyPackTable from "./ReadyPackTable";
import ReadyPackStatTable from "./ReadyPackStatTable";
import ReadyPackRateModal from "./ReadyPackRateModal";
import ReadyPackProductModal from "./ReadyPackProductModal";
import ReadyPackDetailModal from "./ReadyPackDetailModal";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "123456";
const PAGE_SIZE = 20;

const emptyRate: ReadyPackRate = {
  ngay: new Date().toISOString().slice(0, 10),
  nhan_vien: "",
  mat_hang_id: undefined,
  mat_hang: "",
  tong_don: 0,
  don_san: 0,
  ghi_chu: "",
};

const emptyProduct: ReadyPackProduct = {
  ten_mat_hang: "",
  sku: "",
  phan_loai: "",
  is_active: true,
};

type StatMode = "detail" | "day" | "month";

export default function ReadyPackRatePage() {
  const { rows, products, loading, lastUpdate, loadData } = useReadyPackData();

  const [isAdmin, setIsAdmin] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [statMode, setStatMode] = useState<StatMode>("detail");

  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [rateForm, setRateForm] = useState<ReadyPackRate>(emptyRate);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] =
    useState<ReadyPackProduct>(emptyProduct);

  const [detailItem, setDetailItem] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function showError(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2800);
  }

  useEffect(() => {
    setIsAdmin(localStorage.getItem("ready_pack_admin") === "1");
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword, statMode]);

  const filtered = useMemo(
    () => filterReadyPackRows(rows, keyword),
    [rows, keyword]
  );

  const kpi = useMemo(() => getReadyPackKpi(filtered), [filtered]);
  const dayStats = useMemo(() => groupByDay(filtered), [filtered]);
  const monthStats = useMemo(() => groupByMonth(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageRows = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  function confirmAdminKey() {
    if (adminKey !== ADMIN_PIN) {
      showError("Sai key quản lý");
      return;
    }

    localStorage.setItem("ready_pack_admin", "1");
    setIsAdmin(true);
    setAdminKey("");
    setShowKeyModal(false);
  }

  async function submitRate(e: React.FormEvent) {
    e.preventDefault();

    if (!isAdmin) {
      showError("Bạn chỉ có quyền xem");
      return;
    }

    if (!rateForm.ngay) {
      showError("Vui lòng chọn ngày");
      return;
    }

    if (!rateForm.nhan_vien.trim()) {
      showError("Vui lòng nhập người chuẩn bị");
      return;
    }

    if (!rateForm.mat_hang_id || !rateForm.mat_hang) {
      showError("Vui lòng chọn mặt hàng");
      return;
    }

    if (Number(rateForm.tong_don) < 0) {
      showError("Nhu cầu không được âm");
      return;
    }

    if (Number(rateForm.don_san) < 0) {
      showError("Số lượng đã đóng không được âm");
      return;
    }

    const payload: ReadyPackRate = {
      ...rateForm,
      nhan_vien: rateForm.nhan_vien.trim().toUpperCase(),
      mat_hang: rateForm.mat_hang.trim(),
      tong_don: Number(rateForm.tong_don || 0),
      don_san: Number(rateForm.don_san || 0),
      created_by: rateForm.created_by || "ADMIN",
    };

    setSaving(true);

    try {
      if (editingRateId) {
        await updateReadyPackRate(editingRateId, payload);
      } else {
        await createReadyPackRate(payload);
      }

      setRateForm(emptyRate);
      setEditingRateId(null);
      setShowRateModal(false);
      await loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  }

  async function removeRate(id?: number) {
    if (!id) return;
    if (!confirm("Xóa dòng này?")) return;

    try {
      await deleteReadyPackRate(id);
      await loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Lỗi xóa dữ liệu");
    }
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!isAdmin) {
      showError("Bạn chỉ có quyền xem");
      return;
    }

    if (!productForm.ten_mat_hang.trim()) {
      showError("Vui lòng nhập tên mặt hàng");
      return;
    }

    if (!productForm.phan_loai?.trim()) {
      showError("Vui lòng nhập phân loại");
      return;
    }

    const payload: ReadyPackProduct = {
      ...productForm,
      ten_mat_hang: productForm.ten_mat_hang.trim().toUpperCase(),
      sku: productForm.sku?.trim().toUpperCase() || "",
      phan_loai: productForm.phan_loai?.trim().toUpperCase() || "",
      is_active: productForm.is_active !== false,
    };

    try {
      if (editingProductId) {
        await updateReadyPackProduct(editingProductId, payload);
      } else {
        await createReadyPackProduct(payload);
      }

      setProductForm(emptyProduct);
      setEditingProductId(null);
      await loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Lỗi lưu mặt hàng");
    }
  }

  async function removeProduct(id?: number) {
    if (!id) return;
    if (!confirm("Tắt mặt hàng này?")) return;

    try {
      await deleteReadyPackProduct(id);
      await loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Lỗi tắt mặt hàng");
    }
  }

  return (
    <div className="rpr-page">
      {message && <div className="rpr-mini-toast">{message}</div>}

      <ReadyPackKpi kpi={kpi} />

      <section className="rpr-panel">
        <ReadyPackToolbar
          isAdmin={isAdmin}
          loading={loading}
          keyword={keyword}
          statMode={statMode}
          lastUpdate={lastUpdate}
          onKeywordChange={setKeyword}
          onStatModeChange={setStatMode}
          onOpenKey={() => setShowKeyModal(true)}
          onLogout={() => {
            localStorage.removeItem("ready_pack_admin");
            setIsAdmin(false);
          }}
          onAddRate={() => {
            setEditingRateId(null);
            setRateForm(emptyRate);
            setShowRateModal(true);
          }}
          onOpenProducts={() => {
            setEditingProductId(null);
            setProductForm(emptyProduct);
            setShowProductModal(true);
          }}
          onReload={loadData}
        />

        {statMode === "detail" ? (
          <ReadyPackTable
            rows={pageRows}
            isAdmin={isAdmin}
            page={page}
            totalPages={totalPages}
            totalRows={filtered.length}
            onPageChange={setPage}
            onEdit={(row) => {
              setEditingRateId(row.id || null);
              setRateForm(row);
              setShowRateModal(true);
            }}
            onRemove={removeRate}
          />
        ) : (
          <ReadyPackStatTable
            mode={statMode}
            rows={statMode === "day" ? dayStats : monthStats}
            onDetail={setDetailItem}
          />
        )}
      </section>

      {showRateModal && (
        <ReadyPackRateModal
          form={rateForm}
          products={products}
          editingId={editingRateId}
          saving={saving}
          onClose={() => {
            if (!saving) setShowRateModal(false);
          }}
          onSubmit={submitRate}
          onChange={setRateForm}
        />
      )}

      {showProductModal && (
        <ReadyPackProductModal
          isAdmin={isAdmin}
          products={products}
          form={productForm}
          editingId={editingProductId}
          onClose={() => setShowProductModal(false)}
          onSubmit={submitProduct}
          onChange={setProductForm}
          onEdit={(product) => {
            setEditingProductId(product.id || null);
            setProductForm(product);
          }}
          onRemove={removeProduct}
          onReset={() => {
            setProductForm(emptyProduct);
            setEditingProductId(null);
          }}
        />
      )}

      {detailItem && (
  <ReadyPackDetailModal
    item={detailItem}
    onClose={() => setDetailItem(null)}
  />
)}

      {showKeyModal && (
        <div className="rpr-modal-bg" onClick={() => setShowKeyModal(false)}>
          <div className="rpr-key-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rpr-key-icon">🛡️</div>

            <h3>Nhập key quản lý</h3>
            <p>Nhập key để mở chức năng thêm, sửa, xóa.</p>

            <div className="key-field">
              <label>PIN / KEY</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Nhập key quản lý..."
              />
            </div>

            <div className="rpr-form-actions">
              <button
                type="button"
                className="rpr-btn ghost"
                onClick={() => setShowKeyModal(false)}
              >
                Hủy
              </button>

              <button
                type="button"
                className="rpr-btn primary"
                onClick={confirmAdminKey}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}