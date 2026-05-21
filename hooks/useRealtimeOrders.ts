import { useEffect, useState } from "react";
import { fetchSheetData } from "../lib/fetch-sheet";
import { parseRows } from "../lib/order-utils";
import type { Order, SheetsData } from "../types/order";
import { REFRESH_MS } from "../constants/warehouse";
import type { ToastItem } from "../components/Toast";

export function useRealtimeOrders(notify?: (type: ToastItem["type"], message: string) => void) {
  const [sheets, setSheets] = useState<SheetsData>({});
  const [sheetName, setSheetName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastUpdate, setLastUpdate] = useState("Đang tải...");
  const [isOk, setIsOk] = useState(false);

  useEffect(() => {
    let lastHash = "";
    let mounted = true;

    async function load() {
      try {
        const data = await fetchSheetData();
        const hash = JSON.stringify(data);

        if (!mounted) return;

        if (hash !== lastHash) {
          if (lastHash) {
            notify?.("info", "Dữ liệu sheet vừa thay đổi");
          }
          lastHash = hash;

          const names = Object.keys(data);
          const current = sheetName || names[0] || "";

          setSheets(data);
          setSheetName(current);
          setOrders(parseRows(data[current] || []));
          setLastUpdate(new Date().toLocaleTimeString("vi-VN"));
          setIsOk(true);
          notify?.("success", "Tải dữ liệu thành công");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Lỗi kết nối";
        setLastUpdate(message);
        setIsOk(false);
        notify?.("error", message);
      }
    }

    load();


     const timer = setInterval(load, REFRESH_MS);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [sheetName]);

  function changeSheet(name: string) {
    setSheetName(name);
    setOrders(parseRows(sheets[name] || []));
  }

  return {
    sheets,
    sheetName,
    orders,
    lastUpdate,
    isOk,
    sheetNames: Object.keys(sheets),
    changeSheet,
  };
}