import { useCallback, useEffect, useRef, useState } from "react";
import type { SheetsData } from "../types/order";
import type { ToastItem } from "../components/Toast";
import {
  fetchMonthData,
  fetchMonthHash,
} from "../lib/fetch-sheet";

export function useMonthOverviewData(
  month: string,
  enabled: boolean,
  notify?: (type: ToastItem["type"], message: string) => void
) {
  const [overviewSheets, setOverviewSheets] = useState<SheetsData>({});
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");

  const requestIdRef = useRef(0);
  const cacheRef = useRef(new Map<string, SheetsData>());
  const hashRef = useRef("");
  const loadOverview = useCallback(async () => {
    if (!enabled) return;

    const requestId = ++requestIdRef.current;
    const key = month || "ACTIVE";

    setOverviewLoading(true);
    setOverviewError("");
    setOverviewSheets({});

    const cached = cacheRef.current.get(key);

    if (cached) {
      setOverviewSheets(cached);
      setOverviewLoading(false);
      return;
    }

      try {
      const data = await fetchMonthData(month);

      if (requestId !== requestIdRef.current) return;

      const hashData = await fetchMonthHash(month);

      hashRef.current = hashData.hash;

      cacheRef.current.set(key, data);
      setOverviewSheets(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      const message =
        err instanceof Error ? err.message : "Lỗi tải tổng quan";

      setOverviewSheets({});
      setOverviewError(message);
      notify?.("error", message);
    } finally {
      if (requestId === requestIdRef.current) {
        setOverviewLoading(false);
      }
    }
  }, [month, enabled, notify]);
useEffect(() => {
  if (!enabled) return;

  const timer = setInterval(async () => {
    try {
      const hashData = await fetchMonthHash(month);

      if (
        hashRef.current &&
        hashRef.current !== hashData.hash
      ) {
        hashRef.current = hashData.hash;

        notify?.(
          "info",
          `📢 Dữ liệu tháng ${month || "hiện tại"} vừa thay đổi`
        );

        const data = await fetchMonthData(month);

        setOverviewSheets(data);
      }
    } catch {}
  }, 15000);

  return () => clearInterval(timer);
}, [month, enabled, notify]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOverview();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  return {
    overviewSheets,
    overviewLoading,
    overviewError,
    reloadOverview: loadOverview,
  };
}