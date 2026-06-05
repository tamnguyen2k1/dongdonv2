import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMonthData } from "../lib/fetch-sheet";
import type { SheetsData } from "../types/order";
import type { ToastItem } from "../components/Toast";

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
    loadOverview();
  }, [loadOverview]);

  return {
    overviewSheets,
    overviewLoading,
    overviewError,
    reloadOverview: loadOverview,
  };
}