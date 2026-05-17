import ModalStat from "./ModalStat";
import { avLt, stType, statusClass } from "../lib/order-utils";
import type { Order } from "../types/order";

type Props = {
  modalNV: string | null;
  modalOrders: Order[];
  modalSearch: string;
  modalDong: number;
  modalDan: number;
  onClose: () => void;
  onSearch: (v: string) => void;
};

export default function ModalDetail({
  modalNV,
  modalOrders,
  modalSearch,
  modalDong,
  modalDan,
  onClose,
  onSearch,
}: Props) {
  if (!modalNV) return null;

  return (
    <div
      className="modal-bg"
      style={{ display: "flex" }}
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mh">
          <div className="mt">
            <div className="nvc" style={{ gap: 10 }}>
              <div
                className="av"
                style={{
                  width: 38,
                  height: 38,
                  fontSize: 13,
                }}
              >
                {avLt(modalNV)}
              </div>

              <span>👤 {modalNV}</span>
            </div>
          </div>

          <button className="cbtn" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="ms">
          <ModalStat
            label="Đóng"
            value={modalDong}
            color="var(--green)"
          />

          <ModalStat
            label="Dán"
            value={modalDan}
            color="var(--blue)"
          />

          <ModalStat
            label="Tổng"
            value={modalDong + modalDan}
          />

          <ModalStat
            label="Mã đơn"
            value={modalOrders.length}
            color="var(--amber)"
          />

          <ModalStat
            label="Picker"
            value={
              new Set(
                modalOrders
                  .map((o) => o.picker)
                  .filter(Boolean)
              ).size
            }
            color="var(--cyan)"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="sw">
            <i className="fa fa-magnifying-glass" />

            <input
              className="ctrl"
              placeholder="Tìm mã / picker..."
              style={{
                width: "100%",
                borderRadius: 9,
              }}
              value={modalSearch}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        <div>
          {modalOrders.length === 0 ? (
            <div className="empty">
              <i className="fa-solid fa-magnifying-glass" />
              Không tìm thấy
            </div>
          ) : (
            modalOrders.map((o, i) => {
              const t = stType(o.status);

              const pc = statusClass(o.status);

              return (
                <div
                  className="oi"
                  key={`${o.ma}-${i}`}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        wordBreak: "break-all",
                      }}
                    >
                      {o.ma}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      Block: <b>{o.block}</b>
                      &nbsp;|&nbsp;
                      Picker:{" "}
                      <b style={{ color: "var(--purple)" }}>
                        {o.picker || "N/A"}
                      </b>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <span className={`pill ${pc}`}>
                      {o.status}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-d)",
                        fontSize: 15,
                        color: "var(--muted)",
                      }}
                    >
                      ×{o.so}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}