import type { ReadyPackRate } from "../../lib/ready-pack-rate";
import { calcRate } from "../../utils/ready-pack-calc";

type Props = {
  rows: ReadyPackRate[];
  isAdmin: boolean;
  page: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onEdit: (row: ReadyPackRate) => void;
  onRemove: (id?: number) => void;
};

export default function ReadyPackTable({
  rows,
  isAdmin,
  page,
  totalPages,
  totalRows,
  onPageChange,
  onEdit,
  onRemove,
}: Props) {
  return (
    <>
      <div className="rpr-table-wrap">
        <table className="rpr-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Nhân viên</th>
              <th>Mặt hàng</th>
              <th>Tổng</th>
              <th>Đóng sẵn</th>
              <th>Tỷ lệ</th>
              <th>Người tạo</th>
              {isAdmin && <th>Thao tác</th>}
            </tr>
          </thead>

          <tbody>
            {rows.map((x) => {
              const tyLe = calcRate(Number(x.don_san), Number(x.tong_don));

              return (
                <tr key={`rate-${x.id}`}>
                  <td>{x.ngay}</td>
                  <td>{x.nhan_vien}</td>
                  <td>
                    <strong>{x.mat_hang || "—"}</strong>
                    {x.ghi_chu && <small>{x.ghi_chu}</small>}
                  </td>
                  <td>{x.tong_don}</td>
                  <td>
                    <span className="rpr-pill blue">{x.don_san}</span>
                  </td>
                  <td>
                    <div className="rpr-progress">
                      <i style={{ width: `${tyLe}%` }} />
                    </div>
                    <b>{tyLe}%</b>
                  </td>
                  <td>{x.created_by || "ADMIN"}</td>

                  {isAdmin && (
                    <td>
                      <div className="rpr-row-actions">
                        <button onClick={() => onEdit(x)}>Sửa</button>
                        <button onClick={() => onRemove(x.id)}>Xóa</button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td colSpan={isAdmin ? 8 : 7}>
                  <div className="rpr-empty">Chưa có dữ liệu</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rpr-pagination">
        <span>
          Hiển thị {rows.length} / {totalRows} dòng
        </span>

        <div>
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            ‹
          </button>

          <b>{page}</b>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}