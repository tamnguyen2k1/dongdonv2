import type { Order } from "@/types/order";

export function exportCSV(rows: Order[], name: string) {
  if (!rows.length) {
    alert("Không có dữ liệu!");
    return;
  }

  let csv = "\uFEFFNhân Viên,Block,Mã Đơn,Trạng Thái,Picker,Số Lượng\n";

  rows.forEach((o) => {
    csv += `"${o.nv}","${o.block}","${o.ma}","${o.status}","${
      o.picker || ""
    }",${o.so}\n`;
  });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(
    new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    })
  );

  a.download = `${name}_${new Date()
    .toLocaleDateString("vi-VN")
    .replace(/\//g, "-")}.csv`;

  a.click();
}