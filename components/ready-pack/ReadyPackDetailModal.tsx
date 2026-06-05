import type { ReadyPackRate } from "../../lib/ready-pack-rate";

type Props = {
  item: any;
  onClose: () => void;
};

export default function ReadyPackDetailModal({
  item,
  onClose,
}: Props) {
  return (
    <div className="rpr-modal-bg" onClick={onClose}>
      <div
        className="rpr-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="rpr-close" onClick={onClose}>
          ×
        </button>

        <h3>Chi tiết đóng sẵn</h3>

        <div className="rpr-detail-grid">
          <div>
            <span>Nhân viên</span>
            <b>{item.nhan_vien}</b>
          </div>

          <div>
            <span>Mặt hàng</span>
            <b>{item.mat_hang}</b>
          </div>

          <div>
            <span>Tổng đơn</span>
            <b>{item.tong_don}</b>
          </div>

          <div>
            <span>Đóng sẵn</span>
            <b>{item.don_san}</b>
          </div>
        </div>

        <div className="rpr-table-wrap compact">
          <table className="rpr-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tổng</th>
                <th>Đóng sẵn</th>
                <th>Ghi chú</th>
                <th>Người tạo</th>
              </tr>
            </thead>

            <tbody>
              {item.rows.map((x: ReadyPackRate) => (
                <tr key={`detail-${x.id}`}>
                  <td>{x.ngay}</td>
                  <td>{x.tong_don}</td>
                  <td>{x.don_san}</td>
                  <td>{x.ghi_chu || "—"}</td>
                  <td>{x.created_by || "ADMIN"}</td>
                </tr>
              ))}

              {!item.rows.length && (
                <tr>
                  <td colSpan={5}>
                    <div className="rpr-empty">
                      Không có dữ liệu
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