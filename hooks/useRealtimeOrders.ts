import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSheetData,
  fetchSheetMonths,
  fetchSheetNames,
  type SheetMonth,
} from "../lib/fetch-sheet";
import { parseRows } from "../lib/order-utils";
import type { Order, SheetsData } from "../types/order";
import { REFRESH_MS } from "../constants/warehouse";
import type { ToastItem } from "../components/Toast";

// Số sheet prefetch song song (tránh rate limit server)
const PREFETCH_CONCURRENCY = 4;

async function batchedPrefetch<T>(
  items: string[],
  fn: (item: string) => Promise<T>,
  concurrency: number,
  onDone?: (item: string, result: T) => void,
  signal?: { cancelled: boolean }
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      if (signal?.cancelled) return;
      const item = items[i++];
      try {
        const result = await fn(item);
        if (!signal?.cancelled) onDone?.(item, result);
      } catch {
        // prefetch fail thì bỏ qua, user load lại khi cần
      }
    }
  });
  await Promise.all(workers);
}

export function useRealtimeOrders(
  notify?: (type: ToastItem["type"], message: string) => void
) {
  const [month, setMonthState] = useState("");
  const [months, setMonths] = useState<SheetMonth[]>([]);
  const [sheets, setSheets] = useState<SheetsData>({});
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetName, setSheetName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastUpdate, setLastUpdate] = useState("Đang tải...");
  const [isOk, setIsOk] = useState(false);
  const [loading, setLoading] = useState(false);
  // Số sheet đã prefetch xong (để hiện progress)
  const [prefetchCount, setPrefetchCount] = useState(0);

  const epochRef = useRef(0);
  const dataCacheRef = useRef(new Map<string, SheetsData>());
  const namesCacheRef = useRef(new Map<string, string[]>());
  const monthRef = useRef("");

  const setMonth = useCallback((value: string) => {
    monthRef.current = value;
    epochRef.current++;
    setMonthState(value);
    setSheets({});
    setSheetNames([]);
    setSheetName("");
    setOrders([]);
    setIsOk(false);
    setLoading(true);
    setPrefetchCount(0);
    setLastUpdate("Đang tải tháng...");
  }, []);

  useEffect(() => {
    fetchSheetMonths()
      .then(setMonths)
      .catch(() => notify?.("error", "Không tải được danh sách tháng"));
  }, [notify]);

  // loadSheet không phụ thuộc `month` state — đọc qua monthRef
  const loadSheet = useCallback(
    async (name: string, silent = false) => {
      if (!name) return;

      const epoch = epochRef.current;
      const currentMonth = monthRef.current;
      const cacheKey = `${currentMonth || "ACTIVE"}:${name}`;

      if (!silent) {
        setLoading(true);
        setIsOk(false);
      }

      const cached = dataCacheRef.current.get(cacheKey);
      if (cached) {
        if (epoch !== epochRef.current) return;
        setSheets(cached);
        setSheetName(name);
        setOrders(parseRows(cached[name] || []));
        setLastUpdate(silent ? new Date().toLocaleTimeString("vi-VN") : "Cache");
        setIsOk(true);
        if (!silent) setLoading(false);
        return;
      }

      try {
        const data = await fetchSheetData(currentMonth, name);
        if (epoch !== epochRef.current) return;

        dataCacheRef.current.set(cacheKey, data);
        setSheets(data);
        setSheetName(name);
        setOrders(parseRows(data[name] || []));
        setLastUpdate(new Date().toLocaleTimeString("vi-VN"));
        setIsOk(true);
      } catch (err) {
        if (epoch !== epochRef.current) return;
        const message = err instanceof Error ? err.message : "Lỗi kết nối";
        setLastUpdate(message);
        setIsOk(false);
        notify?.("error", message);
      } finally {
        if (epoch === epochRef.current && !silent) setLoading(false);
      }
    },
    [notify]
  );

  // Main effect: chạy khi đổi tháng
  useEffect(() => {
    const epoch = ++epochRef.current;
    const currentMonth = monthRef.current;
    const monthKey = currentMonth || "ACTIVE";
    const signal = { cancelled: false };

    const run = async () => {
      setLoading(true);
      setIsOk(false);
      setSheets({});
      setSheetName("");
      setOrders([]);
      setPrefetchCount(0);

      let names: string[];

      const cachedNames = namesCacheRef.current.get(monthKey);
      if (cachedNames) {
        names = cachedNames;
        setSheetNames(names);
      } else {
        try {
          names = await fetchSheetNames(currentMonth);
        } catch (err) {
          if (signal.cancelled || epoch !== epochRef.current) return;
          const message = err instanceof Error ? err.message : "Lỗi kết nối";
          setLastUpdate(message);
          setIsOk(false);
          setLoading(false);
          notify?.("error", message);
          return;
        }

        if (signal.cancelled || epoch !== epochRef.current) return;

        if (!names.length) {
          setSheetNames([]);
          setLastUpdate("Không có sheet ngày hợp lệ");
          setIsOk(false);
          setLoading(false);
          notify?.("error", "Không có sheet ngày hợp lệ");
          return;
        }

        namesCacheRef.current.set(monthKey, names);
        setSheetNames(names);
      }

      // ── BƯỚC 1: Load sheet đầu tiên ngay (ưu tiên UX) ──
      const firstCacheKey = `${monthKey}:${names[0]}`;
      const firstCached = dataCacheRef.current.get(firstCacheKey);

      if (firstCached) {
        if (!signal.cancelled && epoch === epochRef.current) {
          setSheets(firstCached);
          setSheetName(names[0]);
          setOrders(parseRows(firstCached[names[0]] || []));
          setLastUpdate("Cache");
          setIsOk(true);
          setLoading(false);
        }
      } else {
        // Load sheet đầu tiên — block UI cho đến khi xong
        await loadSheet(names[0]);
      }

      if (signal.cancelled || epoch !== epochRef.current) return;

      // ── BƯỚC 2: Prefetch song song các sheet còn lại ──
      // Ưu tiên sheet ngày hôm nay / gần nhất (names thường sort desc)
      const remaining = names.slice(1).filter(
        (n) => !dataCacheRef.current.has(`${monthKey}:${n}`)
      );

      if (!remaining.length) return;

      await batchedPrefetch(
        remaining,
        (name) => fetchSheetData(currentMonth, name),
        PREFETCH_CONCURRENCY,
        (name, data) => {
          const key = `${monthKey}:${name}`;
          dataCacheRef.current.set(key, data);
          setPrefetchCount((c) => c + 1); // cập nhật progress
        },
        signal
      );
    };

    run();

    return () => {
      signal.cancelled = true;
    };
  }, [month, notify, loadSheet]);

  // Auto-refresh sheet đang xem (silent)
  useEffect(() => {
    if (!sheetName) return;
    const timer = setInterval(() => {
      // Invalidate cache để lấy data mới nhất
      const monthKey = monthRef.current || "ACTIVE";
      dataCacheRef.current.delete(`${monthKey}:${sheetName}`);
      loadSheet(sheetName, true);
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [sheetName, loadSheet]);

  const changeSheet = useCallback(
    (name: string) => {
      epochRef.current++; // cancel mọi silent refresh đang pending
      loadSheet(name);
    },
    [loadSheet]
  );

  return {
    month,
    setMonth,
    months,
    sheets,
    sheetName,
    orders,
    lastUpdate,
    isOk,
    loading,
    sheetNames,
    changeSheet,
    prefetchCount,       // dùng để hiển thị progress bar nếu muốn
    totalSheets: sheetNames.length,
  };
}