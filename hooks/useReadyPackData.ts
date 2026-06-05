"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getReadyPackRates,
  type ReadyPackRate,
} from "../lib/ready-pack-rate";

import {
  getReadyPackProducts,
  type ReadyPackProduct,
} from "../lib/ready-pack-product";

export function useReadyPackData() {
  const [rows, setRows] = useState<ReadyPackRate[]>([]);
  const [products, setProducts] = useState<ReadyPackProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("—");

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [rateRows, productRows] = await Promise.all([
        getReadyPackRates(),
        getReadyPackProducts(),
      ]);

      setRows(rateRows);
      setProducts(productRows);
      setLastUpdate(new Date().toLocaleTimeString("vi-VN"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    rows,
    products,
    loading,
    lastUpdate,
    loadData,
  };
}