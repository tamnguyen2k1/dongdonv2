type ReadyPackStatRow = {
  ngay?: string;
  thang?: string;
  nhan_vien: string;
  mat_hang: string;
  tong_don: number;
  don_san: number;
  con_thieu: number;
  ty_le: number;
  rows: unknown[];
};

type Props = {
  mode: "day" | "month";
  rows: ReadyPackStatRow[];
  onDetail: (item: ReadyPackStatRow) => void;
};

export default function ReadyPackStatTable({ mode, rows, onDetail }: Props) {
  return (
    <div className="rpr-table-wrap">
      <table className="rpr-table">
        <thead>
          <tr>
            <th>{mode === "day" ? "Ngày" : "Tháng"}</th>
            <th>Nhân viên</th>
            <th>Mặt hàng</th>
            <th>Nhu cầu</th>
            <th>Đã đóng</th>
            <th>Còn thiếu</th>
            <th>Đáp ứng</th>
            <th>Chi tiết</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((x, i) => (
            <tr key={`stat-${mode}-${i}`}>
              <td>{mode === "day" ? x.ngay : x.thang}</td>
              <td>{x.nhan_vien}</td>
              <td>{x.mat_hang}</td>
              <td>{x.tong_don}</td>
              <td>
                <span className="rpr-pill blue">{x.don_san}</span>
              </td>
              <td>
                <span
                  className={
                    x.con_thieu > 0 ? "rpr-pill red" : "rpr-pill green"
                  }
                >
                  {x.con_thieu}
                </span>
              </td>
              <td>{x.ty_le}%</td>
              <td>
                <button className="rpr-small-btn" onClick={() => onDetail(x)}>
                  Xem
                </button>
              </td>
            </tr>
          ))}

          {!rows.length && (
            <tr>
              <td colSpan={8}>
                <div className="rpr-empty">Chưa có dữ liệu thống kê</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}